import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Categories } from './schema/categories.schema';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create.categories.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Categories.name) private categoryModel: Model<Categories>,
  ) {}

  async createCategory(dto: CreateCategoryDto) {
    const slug = dto.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .trim()
      .replace(/[\s_]+/g, '-'); // Replace spaces and underscores with hyphens

    const existingCategories = await this.categoryModel
      .findOne({ slug: slug })
      .exec();
    if (existingCategories) {
      throw new ConflictException(`Danh mục với slug "${slug}" đã tồn tại.`);
    }

    // Define create name Categories
    const newCategories = new this.categoryModel({
      name: dto.name,
      slug: slug,
      description: dto.description,
      ordinal: dto.ordinal,
    });
    return await newCategories.save();
  }

  async getCategoryAll() {
    return await this.categoryModel.find().sort({ ordinal: 1 }).lean();
  }

  async getCategoryByName(name: string) {
    const category = await this.categoryModel.findOne({ name });
    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục với tên: "${name}"`);
    }
    return category;
  }
}
