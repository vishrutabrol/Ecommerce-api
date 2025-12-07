import { IsInt, IsPositive } from 'class-validator';

export class AddToCartDto {
  @IsInt()
  userId: number;

  @IsInt()
  productId: number;

  @IsInt()
  @IsPositive()
  quantity: number;
}

export class UpdateCartItemDto {
  @IsInt()
  cartItemId: number;

  @IsInt()
  @IsPositive()
  quantity: number;
}

export interface CartItemResponse {
  id: number;
  productId: number;
  quantity: number;
  applicableAmount: number;
  cartId: number;
}
