import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class ChallengeSnapshot {
  @Prop({ type: String }) title: string;
  @Prop({ type: String }) slug: string;
  @Prop({ type: String }) difficulty: string;
  @Prop({ type: [String] }) skillSlugs: string[];
  @Prop({ type: Number }) xpReward: number;
}

@Schema({ _id: false })
class RoadmapNode {
  @Prop({ type: Number, required: true }) order: number;
  @Prop({ type: Types.ObjectId, ref: 'Challenge', required: true })
  challengeId: Types.ObjectId;
  @Prop({ type: String, enum: ['challenge', 'checkpoint'] }) nodeType: string;
  @Prop({ type: ChallengeSnapshot }) challengesSnapshot?: ChallengeSnapshot;
}

@Schema({ timestamps: true })
export class RoadmapTemplate extends Document {
  @Prop({ type: String, required: true }) title: string;
  @Prop({ type: String, required: true, unique: true }) slug: string;
  @Prop({ type: String }) description?: string;
  @Prop({
    type: String,
    enum: ['absolute_beginner', 'beginner', 'intermediate', 'advanced'],
  })
  targetLevel?: string;
  @Prop({ type: Types.ObjectId, ref: 'Category' }) categoryId?: Types.ObjectId;
  @Prop({ type: [RoadmapNode] }) nodes: RoadmapNode[];
  @Prop({ type: Boolean, default: true }) isActive: boolean;
}
export const RoadmapTemplateSchema =
  SchemaFactory.createForClass(RoadmapTemplate);

@Schema({ _id: false })
class GenerationParams {
  @Prop({ type: String }) detectedLevel?: string;
  @Prop({ type: [String] }) weakSkills: string[];
  @Prop({ type: [String] }) strongSkills: string[];
  @Prop({ type: String, enum: ['slow', 'medium', 'fast'] })
  pacePreference?: string;
}

@Schema({ timestamps: true })
export class UserRoadmap extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'RoadmapTemplate', required: true })
  templateId: Types.ObjectId;
  @Prop({ type: String, required: true }) title: string;
  @Prop({
    type: String,
    required: true,
    enum: ['draft', 'active', 'completed', 'archived'],
  })
  status: string;
  @Prop({ type: Number }) totalNodes?: number;
  @Prop({ type: Number }) completedNodes?: number;
  @Prop({ type: GenerationParams }) generationParams?: GenerationParams;
}
export const UserRoadmapSchema = SchemaFactory.createForClass(UserRoadmap);
