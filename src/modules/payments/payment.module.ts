import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/entities/payment.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { CartItem } from '../../entities/cart-item.entity';
import { Cart } from '../../entities/cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Cart, CartItem])],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
