import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
export type AttemptDocument = HydratedDocument<Attempt>;
@Schema({ timestamps: true }) // Timestamps will automatically create createdAt and updatedAt fields
export class Attempt extends Document {
  declare _id: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user!: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Challenge' })
  challenge!: Types.ObjectId;
  @Prop()
  currentCode!: string;
  @Prop({ default: 'in progress' })
  status!: string; // 'in progress', 'completed', 'failed'
  @Prop({ default: 0 })
  runCount!: number;
  @Prop()
  startedAt!: Date;
  @Prop()
  completedAt?: Date;
}
export const AttemptSchema = SchemaFactory.createForClass(Attempt);
