import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
  @IsString()
  @IsOptional()
  description?: string;
  @IsNumber()
  @IsOptional()
  ordinal?: number;
}
