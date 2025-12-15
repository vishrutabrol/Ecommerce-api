import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../../entities/cart.entity';
import { CartItem } from '../../entities/cart-item.entity';
import { Product } from '../../entities/product.entity';
import { AddToCartDto, CartItemResponse } from './cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private cartItemRepo: Repository<CartItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async addToCart(dto: AddToCartDto): Promise<CartItemResponse> {
    const product = await this.productRepo.findOne({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');

    let cart = await this.cartRepo.findOne({
      where: { userId: dto.userId },
      relations: ['items'],
    });
    if (!cart) {
      cart = this.cartRepo.create({ userId: dto.userId, totalAmount: 0 });
      cart = await this.cartRepo.save(cart);
    }

    let cartItem = await this.cartItemRepo.findOne({
      where: { cart: { id: cart.id }, productId: dto.productId },
      relations: ['cart'],
    });

    if (cartItem) {
      cartItem.quantity += dto.quantity;
      cartItem.applicableAmount = Number(product.price) * cartItem.quantity;
      cartItem.cart = cart;
    } else {
      cartItem = this.cartItemRepo.create({
        userId: dto.userId,
        productId: dto.productId,
        quantity: dto.quantity,
        applicableAmount: Number(product.price) * dto.quantity,
        cart: cart,
      });
    }

    await this.cartItemRepo.save(cartItem);

    const items = await this.cartItemRepo.find({ where: { cart: { id: cart.id } } });
    cart.totalAmount = items.reduce((sum, i) => sum + Number(i.applicableAmount), 0);
    await this.cartRepo.save(cart);

    return {
      id: cartItem.id,
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      applicableAmount: cartItem.applicableAmount,
      cartId: cart.id,
    };
  }

  async getCartItems(userId: number): Promise<Cart> {
    const cart = await this.cartRepo.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });
    if (!cart) throw new NotFoundException('Cart not found');
    return cart;
  }
}
