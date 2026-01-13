import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
// import type Stripe from 'stripe'; // Proper Stripe type
import { Payment } from '../../entities/payment.entity';
import { Cart } from '../../entities/cart.entity';
import { CartItem } from '../../entities/cart-item.entity';
import { PurchasedItemDto } from './payment.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(Cart)
    private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepo: Repository<CartItem>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-12-15.clover', // Valid Stripe version
    });
  }

  // MAIN ENDPOINT - Create checkout with payment record
  async processPayment(
    userId: number,
    cartId: number,
  ): Promise<{
    payment: Payment;
    stripeSessionUrl: string;
  }> {
    // 1. Get cart with relations
    const cart = await this.cartRepo.findOne({
      where: { id: cartId, userId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      throw new NotFoundException(`Cart ${cartId} not found`);
    }

    if (!cart.items?.length) {
      throw new BadRequestException('Cart is empty');
    }

    // 2. Prepare purchased items
    const purchasedItems: PurchasedItemDto[] = cart.items.map((item) => ({
      productId: item.productId,
      name: item.product?.name || `Product ${item.productId}`,
      quantity: item.quantity,
      priceAtPurchase: Number(item.priceAtAdd), // Fixed: Use priceAtAdd
    }));

    // 3. Validate total
    const calculatedTotal = purchasedItems.reduce(
      (sum, item) => sum + item.quantity * item.priceAtPurchase,
      0,
    );

    if (Math.abs(calculatedTotal - Number(cart.totalAmount)) > 0.01) {
      throw new BadRequestException('Price mismatch detected');
    }

    // 4. Create pending payment
    const payment = this.paymentRepo.create({
      userId,
      cartId,
      totalAmount: Number(cart.totalAmount),
      status: 'pending',
      purchasedItems,
    });

    const savedPayment = await this.paymentRepo.save(payment);

    // 5. Create Stripe session
    const stripeSession = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: purchasedItems.map((item) => ({
        price_data: {
          currency: 'inr',
          product_data: { name: item.name },
          unit_amount: Math.round(item.priceAtPurchase * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout?cancelled=true`,
      metadata: {
        userId: userId.toString(),
        cartId: cartId.toString(),
        paymentId: savedPayment.id.toString(),
      },
    });

    if (!stripeSession.url) {
      throw new InternalServerErrorException('Stripe session failed');
    }

    this.logger.log(`Payment ${savedPayment.id} created for cart ${cartId}`);

    return {
      payment: savedPayment,
      stripeSessionUrl: stripeSession.url,
    };
  }

  // Complete payment after Stripe success
  async completePayment(sessionId: string): Promise<Payment> {
    const stripeSession = await this.stripe.checkout.sessions.retrieve(sessionId);

    if (stripeSession.payment_status !== 'paid') {
      throw new BadRequestException('Payment not successful');
    }

    const metadata = stripeSession.metadata || {};
    const paymentId = parseInt(metadata.paymentId || '0');

    if (!paymentId) {
      throw new BadRequestException('Payment ID not found');
    }

    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId, status: 'pending' },
    });

    if (!payment) {
      throw new NotFoundException('Pending payment not found');
    }

    // Mark success & clear cart
    payment.status = 'success';
    await this.paymentRepo.save(payment);
    await this.cartItemRepo.delete({ cartId: payment.cartId });

    this.logger.log(`Payment ${payment.id} completed`);

    return payment;
  }

  async getPaymentById(id: number, userId: number): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({
      where: { id, userId },
      relations: ['cart'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }
}
