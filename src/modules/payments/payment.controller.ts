// payment.controller.ts
import { Controller, Post, Get, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePaymentDto } from './payment.dto';

@Controller('payment')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('checkout/:cartId')
  async createCheckout(
    @Request() req,
    @Param('cartId') cartId: string,
  ) {
    const userId = req.user.id;
    return this.paymentService.processPayment(userId, parseInt(cartId));
  }

  @Post('complete/:sessionId')
  async completePayment(
    @Param('sessionId') sessionId: string,
  ) {
    return this.paymentService.completePayment(sessionId);
  }

  @Get('user')
  async getUserPayments(@Request() req) {
    // Implementation for listing user payments
  }

  @Get(':id')
  async getPayment(@Param('id') id: string, @Request() req) {
    return this.paymentService.getPaymentById(parseInt(id), req.user.id);
  }
}
