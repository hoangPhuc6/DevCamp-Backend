import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
export type UserDocument = HydratedDocument<User>;
@Schema({ timestamps: true }) // Timestamps will automatically create createdAt and updatedAt fields
export class User extends Document {
  declare _id: Types.ObjectId;
  @Prop()
  email!: string;
  @Prop()
  displayName!: string;
  @Prop()
  passHash?: string;
  @Prop()
  avatarUrl?: string;
  @Prop()
  programLang!: string;
  @Prop()
  currentLevel!: string; // User Level: Beginner, Intermediate, Advanced, Pro
  @Prop({ type: Object })
  thinkingProfile!: {
    strongSkill: string[];
    weakSkill: string[];
    lastUpdateAt: Date;
  };
  @Prop({ type: Object })
  authProviders!: {
    provider: string;
    providerId: string;
    providerEmail: string;
    providerConnectedAt: Date;
  };
  @Prop()
  xpTotal!: number;
  @Prop()
  streakCount!: number;
  @Prop()
  lastActiveAt!: Date;
  @Prop()
  createAt!: Date;
  @Prop()
  updateAt!: Date;
  @Prop({ type: Object })
  refreshToken!: {
    token: string;
    expiresAt: Date;
  };
  @Prop({ type: String, enum: ['admin', 'user'], default: 'user' })
  role!: 'admin' | 'user';
}

export const UserSchema = SchemaFactory.createForClass(User);
