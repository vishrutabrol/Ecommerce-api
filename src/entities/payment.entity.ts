import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Cart } from './cart.entity';
import type { PaymentStatus } from '../common/constant';

@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.payments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'cart_id' })
  cartId: number;

  @ManyToOne(() => Cart, (cart) => cart.payments)
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  })
  status: PaymentStatus;

  @Column({ type: 'json' })
  purchasedItems: {
    productId: number;
    name: string;
    quantity: number;
    priceAtPurchase: number;
  }[];

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;
}
