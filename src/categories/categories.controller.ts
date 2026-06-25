import { Controller, Post, Get, Body, HttpCode, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create.categories.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UseGuards } from '@nestjs/common';
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  @Post('create')
  // @Roles('admin') import role.guard.ts later
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoriesService.createCategory(createCategoryDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async getCategoryAll() {
    return await this.categoriesService.getCategoryAll();
  }

  @Get(':name')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async getCategoryByName(@Param('name') name: string) {
    return await this.categoriesService.getCategoryByName(name);
  }
}
