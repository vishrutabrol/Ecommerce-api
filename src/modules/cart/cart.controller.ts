import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CartItemDto } from './cart.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../../entities/user.entity';

interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Req() req): Promise<any> {
    return this.cartService.getCartForUser(req.user.id);
  }

  @Post()
  async upsertItem(@Req() req: AuthRequest, @Body() dto: CartItemDto): Promise<any> {
    console.log('JWT user:', req.user);
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.cartService.upsertItem(userId, dto);
  }

  @Delete(':productId')
  async removeItem(@Req() req, @Param('productId') productId: string): Promise<any> {
    return this.cartService.removeItem(req.user.id, parseInt(productId));
  }

  @Delete()
  async clearCart(@Req() req): Promise<void> {
    return this.cartService.clearCart(req.user.id);
  }
}
