import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Category } from 'src/entities/category.entity';
import {
  AddCategoryDto,
  CreateCreateDto,
  PaginatedCategory,
  UpdateCreateDto,
} from './category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async createCategory(dto: CreateCreateDto): Promise<Category> {
    const category = this.categoryRepo.create(dto);
    return this.categoryRepo.save(category);
  }

  async updateCategory(dto: UpdateCreateDto): Promise<Category> {
    // 1. Find existing category
    const category = await this.categoryRepo.findOne({ where: { id: dto.id } });
    if (!category) {
      throw new NotFoundException(`Category with id ${dto.id} not found`);
    }

    // 2. Merge updates
    Object.assign(category, dto);

    // 3. Save updated entity
    return this.categoryRepo.save(category);
  }

  async getAllCategory(
    page: number = 1,
    limit: number = 10,
    type?: string,
    search?: string,
  ): Promise<PaginatedCategory> {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (type) {
      where.type = type.toLowerCase();
    }

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    const [data, total] = await this.categoryRepo.findAndCount({
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
}
