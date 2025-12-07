import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  price: string;

  @Column()
  brand: string;

  @Column({ type: 'json' })
  images: JSON;

  @Column({ nullable: false })
  ownerid: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerid' })
  owner: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  type: string;

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;
}
