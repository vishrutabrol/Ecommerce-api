import { Controller, Post, Body, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from 'src/entities/category.entity';
import { AddCategoryDto, EditCategoryDto, PaginatedCategory } from './category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(JwtAuthGuard)
  @Post('add')
  async create(@Body() dto: AddCategoryDto): Promise<Category> {
    return this.categoryService.createCategory(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update')
  async update(@Body() dto: EditCategoryDto): Promise<Category> {
    return this.categoryService.updateCategory(dto);
  }

  @Get('list')
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
  ): Promise<PaginatedCategory> {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    return this.categoryService.getAllCategory(pageNum, limitNum, type);
  }
}
