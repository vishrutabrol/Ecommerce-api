// payment.dto.ts
import { IsNumber, IsEnum, IsArray, ValidateNested, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class PurchasedItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsPositive()
  priceAtPurchase: number;

  @IsNumber()
  name: string;
}

export class CreatePaymentDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  cartId: number;

  @IsNumber()
  @IsPositive()
  totalAmount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchasedItemDto)
  purchasedItems: PurchasedItemDto[];
}
