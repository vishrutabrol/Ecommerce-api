import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from './product.entity';

@Entity('cart_items')
@Index(['cartId', 'productId'], { unique: true })
// cart-item.entity.ts - FIXED
@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cart_id' }) // Maps camelCase to snake_case DB column
  cartId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ default: 1 })
  quantity: number;

  @Column({ name: 'price_at_add', type: 'decimal', precision: 10, scale: 2 })
  priceAtAdd: number;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' }) //Explicit join column
  cart: Cart;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product?: Product;
}
