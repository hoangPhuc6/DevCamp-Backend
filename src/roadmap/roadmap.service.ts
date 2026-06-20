import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoadmapTemplate, UserRoadmap } from './roadmap.schemas';

@Injectable()
export class RoadmapService {
  constructor(
    @InjectModel(RoadmapTemplate.name)
    private templateModel: Model<RoadmapTemplate>,
    @InjectModel(UserRoadmap.name) private userRoadmapModel: Model<UserRoadmap>,
  ) {}

  getRoadmaps(userId: string) {
    return this.userRoadmapModel.find({ userId }).exec();
  }

  putRoadmaps(userId: string, updateData: any) {
    return this.userRoadmapModel
      .findOneAndUpdate({ userId, status: 'active' }, updateData, { new: true })
      .exec();
  }
}
