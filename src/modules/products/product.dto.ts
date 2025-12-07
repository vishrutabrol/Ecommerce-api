import { Product } from "src/entities/product.entity";

export class CreateProductDto {
  name: string;
  price: string;
  brand: string;
  images: any;
  ownerid: number;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
}
