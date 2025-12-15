import { IsInt, IsJSON, IsString } from 'class-validator';
import { Category } from 'src/entities/category.entity';

export class AddCategoryDto {
  @IsString()
  name: string;

  @IsJSON()
  images: string;

  @IsString()
  type: string;
}

export class EditCategoryDto {
  @IsInt()
  id: number;
  
  @IsString()
  name?: string;

  @IsJSON()
  images?: string;

  @IsString()
  type?: string;
}

export class CreateCreateDto {
  name: string;
  images: any;
  type: string;
}

export class UpdateCreateDto {
  id: number;
  name?: string;
  images?: any;
  type?: string;
}

export interface PaginatedCategory {
  data: Category[];
  total: number;
}
