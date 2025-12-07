import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { CreateProductDto, PaginatedProducts } from './product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create(dto);
    return this.productRepo.save(product);
  }

    async getAllProducts(
      page: number = 1,
      limit: number = 10,
      type?: string,
    ): Promise<PaginatedProducts> {
      const skip = (page - 1) * limit;

      const where: any = {};

      if (type) {
        where.type = type.toLowerCase();
      }

      const [data, total] = await this.productRepo.findAndCount({
        where,
        take: limit,
        skip: skip,
        order: { createdat: 'DESC' },
      });

      return {
        data,
        total,
      };
    }

  async getProductById(id: number): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }
    return product;
  }
}
