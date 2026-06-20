import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'challenges', timestamps: true })
export class Challenge extends Document {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({ type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] })
  difficulty: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  categoryId: Types.ObjectId;

  @Prop({ type: Number })
  timeLimit: number;

  @Prop({ type: Number })
  memoryLimit: number;
}
export const ChallengeSchema = SchemaFactory.createForClass(Challenge);

@Schema({ collection: 'submissions', timestamps: true })
export class Submission extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Challenge', required: true })
  challengeId: Types.ObjectId;

  @Prop({ type: String, required: true })
  language: string;

  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: String, required: true, default: 'pending' })
  status: string;

  @Prop({ type: Number, default: 0 })
  runtime: number;

  @Prop({ type: Number, default: 0 })
  memory: number;

  @Prop({ type: String })
  sourceCodePath: string;
}
export const SubmissionSchema = SchemaFactory.createForClass(Submission);
