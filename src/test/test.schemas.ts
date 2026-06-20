import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class GeneratedFor {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ type: String })
  targetWeakness?: string;
}

@Schema({ _id: false })
class StorageRef {
  @Prop({ type: String })
  inputUrl?: string;

  @Prop({ type: String })
  outputUrl?: string;
}

@Schema({ timestamps: true })
export class TestCase extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Challenge', required: true })
  challengeId: Types.ObjectId;

  @Prop({ type: String, required: true })
  input: string; // User answer

  @Prop({ type: String, required: true })
  expectedOutput: string; // Expected answer

  @Prop({
    type: String,
    required: true,
    // Type of test case:
    enum: [
      'sample',
      'hidden',
      'stress',
      'generated',
      'multiple-choice',
      'essay',
    ],
  })
  type: string;

  @Prop({ type: [String] }) // Multiple options for multiple-choice questions (if type is 'multiple-choice')
  options?: string[];

  @Prop({ type: GeneratedFor })
  generatedFor?: GeneratedFor;

  @Prop({ type: StorageRef })
  storageRef?: StorageRef;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const TestCaseSchema = SchemaFactory.createForClass(TestCase);

@Schema({ timestamps: true })
export class TestSubmission extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Challenge', required: true })
  challengeId: Types.ObjectId;

  @Prop({ type: [String], required: true })
  userAnswers: string[];

  @Prop({ type: Number })
  score: number;

  @Prop({ type: String })
  status: string;
}

export const TestSubmissionSchema =
  SchemaFactory.createForClass(TestSubmission);
