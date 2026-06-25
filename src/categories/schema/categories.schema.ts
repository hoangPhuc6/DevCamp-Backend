import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
export type CategoriesDocument = HydratedDocument<Categories>;
@Schema({ timestamps: true }) // Timestamps will automatically create createdAt and updatedAt fields
export class Categories extends Document {
  declare _id: Types.ObjectId;
  @Prop({ unique: true })
  name!: string;
  @Prop({ unique: true })
  slug!: string;
  @Prop()
  description?: string;
  @Prop({ default: 0 })
  ordinal?: number;
}
export const CategoriesSchema = SchemaFactory.createForClass(Categories);
