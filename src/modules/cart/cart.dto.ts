import { IsInt, IsPositive, Min, IsOptional } from 'class-validator';

export class CartItemDto {
  @IsInt()
  @IsPositive()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}
