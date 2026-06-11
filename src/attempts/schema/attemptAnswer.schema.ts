import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
export type AttemptAnswerDocument = HydratedDocument<AttemptAnswer>;
@Schema({ timestamps: true }) // Timestamps will automatically create createdAt and updatedAt fields
export class AttemptAnswer extends Document {
  declare _id: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user!: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Challenge' })
  challenge!: Types.ObjectId; // Because questions are saved in the Challenge collection
  @Prop()
  questionId!: string;
  @Prop({ type: Types.ObjectId, ref: 'Skill' })
  skill!: Types.ObjectId; // Reference to the skill being tested, for easier querying and analytics for gen Roadmap
  @Prop()
  userAnswer!: string;
  @Prop()
  isCorrect!: boolean;
  @Prop()
  score!: number;
  @Prop()
  selectedOptions?: string[]; // For multiple-choice questions, store the selected options.
  @Prop()
  startedAt!: Date;
  @Prop()
  completedAt?: Date;
}

export const AttemptAnswerSchema = SchemaFactory.createForClass(AttemptAnswer);
