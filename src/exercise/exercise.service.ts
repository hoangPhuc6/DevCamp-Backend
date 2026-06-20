import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Challenge, Submission } from './exercise.schemas';
import { UserRoadmap, RoadmapTemplate } from '../roadmap/roadmap.schemas'; // Đường dẫn tương đối tới folder roadmap

@Injectable()
export class ExerciseService {
  constructor(
    @InjectModel(Challenge.name) private challengeModel: Model<Challenge>,
    @InjectModel(Submission.name) private submissionModel: Model<Submission>,
    @InjectModel(UserRoadmap.name) private userRoadmapModel: Model<UserRoadmap>,
    @InjectModel(RoadmapTemplate.name)
    private templateModel: Model<RoadmapTemplate>,
  ) {}

  // GET all the exercises for the active roadmap of the user
  async getExercises(userId: string) {
    const activeRoadmap = await this.userRoadmapModel
      .findOne({ userId: new Types.ObjectId(userId), status: 'active' })
      .exec();

    if (!activeRoadmap) {
      return this.challengeModel.find().exec();
    }

    const template = await this.templateModel
      .findById(activeRoadmap.templateId)
      .exec();

    if (!template || !template.nodes || template.nodes.length === 0) {
      return [];
    }

    const challengeIds = template.nodes.map((node) => node.challengeId);

    return this.challengeModel.find({ _id: { $in: challengeIds } }).exec();
  }

  // GET details of a specific exercise by its ID
  async getExerciseById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Định dạng ID bài tập không hợp lệ');
    }
    const exercise = await this.challengeModel.findById(id).exec();
    if (!exercise) {
      throw new NotFoundException('Không tìm thấy bài tập yêu cầu');
    }
    return exercise;
  }

  // POST a solution for a specific exercise
  async postExercise(
    userId: string,
    challengeId: string,
    data: { language: string; code: string },
  ) {
    if (!Types.ObjectId.isValid(challengeId)) {
      throw new BadRequestException('Định dạng ID bài tập không hợp lệ');
    }

    const challenge = await this.challengeModel.findById(challengeId).exec();
    if (!challenge) {
      throw new NotFoundException('Bài tập không tồn tại trên hệ thống');
    }

    const mockRuntime = Math.floor(Math.random() * 120) + 15;
    const mockMemory = Math.floor(Math.random() * 1024) + 256;
    const statusPool = ['Accepted', 'Wrong Answer', 'Time Limit Exceeded'];
    const mockStatus =
      statusPool[Math.floor(Math.random() * statusPool.length)];

    const newSubmission = new this.submissionModel({
      userId: new Types.ObjectId(userId),
      challengeId: new Types.ObjectId(challengeId),
      language: data.language || 'typescript',
      code: data.code || '',
      status: mockStatus,
      runtime: mockRuntime,
      memory: mockMemory,
      sourceCodePath: `storage/codes/${userId}_${challengeId}.ts`,
    });

    return newSubmission.save();
  }
}
