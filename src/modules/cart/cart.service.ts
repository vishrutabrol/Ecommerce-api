import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Cart } from '../../entities/cart.entity';
import { CartItem } from '../../entities/cart-item.entity'; 
import { CartItemDto } from './cart.dto';
import { User } from '../../entities/user.entity';
import { Product } from '../../entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

async getCartForUser(userId: number): Promise<Cart> {
  // ✅ Debug first
  console.log('🔍 getCartForUser called with userId:', userId);
  
  if (!userId || userId <= 0) {
    throw new BadRequestException('Invalid user ID');
  }

  let cart = await this.cartRepository.findOne({
    where: { userId }, // ✅ DB column name
    relations: ['items.product'],
  });

  if (!cart) {
    // ✅ EXPLICIT userId assignment
    cart = this.cartRepository.create({
      userId: userId, // ✅ Explicit!
      totalQuantity: 0,
      totalAmount: 0.00,
    });
    cart = await this.cartRepository.save(cart);
    console.log('✅ New cart created:', cart.id);
  }

  return cart;
}


async upsertItem(userId: number, dto: CartItemDto): Promise<Cart> {
  const cart = await this.getCartForUser(userId);

  const product = await this.productRepository.findOne({
    where: { id: dto.productId },
  });
  if (!product) {
    throw new NotFoundException('Product not found');
  }

  const existingItem = await this.cartItemRepository.findOne({
    where: { cartId: cart.id, productId: dto.productId },
  });

  let cartItem: CartItem;

  if (existingItem) {
    existingItem.quantity = dto.quantity;
    cartItem = await this.cartItemRepository.save(existingItem);
  } else {
    cartItem = this.cartItemRepository.create({
      cartId: cart.id,
      productId: dto.productId,
      quantity: dto.quantity,
      priceAtAdd: parseFloat(product.price),
    });
    cartItem = await this.cartItemRepository.save(cartItem);
  }

  await this.recalculateCartTotals(cart.id);
  return this.getCartForUser(userId);
}


  async removeItem(userId: number, productId: number): Promise<Cart> {
    const cart = await this.getCartForUser(userId);
    const cartItem = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, productId },
    });

    if (cartItem) {
      await this.cartItemRepository.remove(cartItem);
      await this.recalculateCartTotals(cart.id);
    }

    return this.getCartForUser(userId);
  }

  async clearCart(userId: number): Promise<void> {
    const cart = await this.getCartForUser(userId);
    await this.cartItemRepository.delete({ cartId: cart.id });
    await this.recalculateCartTotals(cart.id);
  }

  private async recalculateCartTotals(cartId: number): Promise<void> {
    const cartItems = await this.cartItemRepository.find({
      where: { cartId },
      relations: ['product'],
    });

    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cartItems.reduce((sum, item) => sum + item.quantity * item.priceAtAdd, 0);

    const cart = await this.cartRepository.findOne({ where: { id: cartId } });
    if (cart) {
      cart.totalQuantity = totalQuantity;
      cart.totalAmount = totalAmount;
      await this.cartRepository.save(cart);
    }
  }
}
