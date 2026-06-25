import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Challenges } from './schema/challenges.schema';
import { StorageService } from './storage.service';
import { CreateChallengeDto } from './dto/createChallenge-dto';
import { Model } from 'mongoose';

@Injectable()
export class ChallengeService {
  constructor(
    @InjectModel(Challenges.name) private challengeModel: Model<Challenges>,
    private storageService: StorageService,
  ) {}

  async createChallenges(dto: CreateChallengeDto) {
    // Define slug from problem_name for consistency
    const slug = dto.problem_name
      .toLowerCase()
      .normalize('NFD') // Remove Vietnamese diacritics
      .replace(/[\u0300-\u036f]/g, '') // Remove Unicode characters
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .trim()
      .replace(/[\s_]+/g, '_'); // Replace spaces with hyphens

    // Proactively check for a duplicate slug to provide a clear error.
    const existingChallenge = await this.challengeModel
      .findOne({ slug })
      .exec();
    if (existingChallenge) {
      throw new ConflictException(`Bài tập với slug "${slug}" đã tồn tại.`);
    }

    // Define create name file in R2
    const fileName = `challenge/${slug}.json`;
    // Package the entire JSON object (including the test_cases array) into a text Buffer to push to R2
    const jsonBuffer = Buffer.from(JSON.stringify(dto, null, 2), 'utf-8');
    // auto upload to R2
    const r2Path = await this.storageService.upFile(
      jsonBuffer,
      fileName,
      'application/json',
    );

    const sample = dto.test_cases
      ? dto.test_cases
          .filter((tc) => tc.type == 'sample') // get type = 'sample'
          .map((tc) => ({
            input: tc.input,
            output: tc.expected_output,
            explanation: tc.explanation || '',
          }))
      : [];

    const newChallenges = new this.challengeModel({
      title: dto.problem_name,
      slug: slug,
      categoryId: dto.categoryId,
      difficulty: dto.difficulty,
      description: dto.description,
      challengeType: dto.challengeType,
      examples: sample,
      testcasePath: r2Path,
    });
    return await newChallenges.save();
  }

  async getChallengeBySlug(slug: string) {
    const challenge = await this.challengeModel.findOne({ slug });
    if (!challenge) {
      // Throw a standard 404 error if the challenge is not found.
      throw new NotFoundException(`Không tìm thấy bài tập với slug: "${slug}"`);
    }
    // Return essential information for displaying the challenge question.
    return {
      title: challenge.title,
      description: challenge.description,
      difficulty: challenge.difficulty,
      examples: challenge.examples,
    };
  }

  async getChallengesAll() {
    return await this.challengeModel.find({}, { testcasePath: 0 }).lean();
  }
}
