import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { Model } from 'mongoose';
import { UpdateProfile } from './user.controller';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}
  // Get all users
  async getProfile() {
    return await this.userModel.find({}).lean();
  }

  // Find user by name
  async getProfileByName(displayName: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ displayName });
  }

  // Update profile (Update name)
  async updateProfile(updateProfileDto: UpdateProfile): Promise<UserDocument> {
    const { email, displayName } = updateProfileDto; // Destructure the email and displayName from the updateProfileDto
    const user = await this.userModel.findOneAndUpdate(
      { email },
      { $set: { displayName } },
      { new: true },
    );
    if (!user) {
      throw new UnauthorizedException('User with this email not found');
    }
    return user;
  }

  //Delete user
  async deleteProfile(displayName: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ displayName });
    if (!user) {
      throw new UnauthorizedException('User with this name not found');
    }
    await user.deleteOne();
    return { message: 'User deleted successfully' };
  }
}

export default UserService;
