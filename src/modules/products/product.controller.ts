import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, PaginatedProducts } from './product.dto';
import { Product } from '../../entities/product.entity';
import { Throttle } from '@nestjs/throttler';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('add-new')
  async create(@Body() dto: CreateProductDto): Promise<Product> {
    return this.productService.createProduct(dto);
  }

  @Get('list')
  // @Throttle({ default: { limit: 2, ttl: 60 } })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
  ): Promise<PaginatedProducts> {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    return this.productService.getAllProducts(pageNum, limitNum, type);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Product> {
    return this.productService.getProductById(id);
  }
}
