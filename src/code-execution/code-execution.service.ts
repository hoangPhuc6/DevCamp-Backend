import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Submission } from './schema/submission.schema';
import { ExecuteCodeDto } from './dto/execute-code.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CodeExecutionService {
  constructor(
    @InjectModel(Submission.name)
    private submissionModel: Model<Submission>,
    @InjectQueue('code-execution')
    private codeExecutionQueue: Queue,
  ) {}

  /**
   * Execute code asynchronously via Job Queue
   */
  async executeCode(
    userId: string,
    executeCodeDto: ExecuteCodeDto,
  ): Promise<Submission> {
    const {
      code,
      input,
      challengeId,
      language = 'cpp',
      timeout = 5,
    } = executeCodeDto;

    // Create submission record with pending status
    const submission = await this.submissionModel.create({
      userId: new Types.ObjectId(userId),
      challengeId: new Types.ObjectId(challengeId),
      code,
      input,
      language,
      status: 'pending',
    });

    try {
      // Add job to the queue
      await this.codeExecutionQueue.add('execute', {
        submissionId: submission._id.toString(),
        code,
        input,
        language,
        timeout,
      });

      return submission;
    } catch {
      submission.status = 'error';
      submission.error = 'Failed to queue execution job';
      await submission.save();

      throw new HttpException(
        'Failed to process code execution request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get user submissions for a challenge
   */
  async getSubmissions(
    userId: string,
    challengeId?: string,
    limit: number = 10,
    skip: number = 0,
  ): Promise<Submission[]> {
    const query: Record<string, Types.ObjectId> = {
      userId: new Types.ObjectId(userId),
    };
    if (challengeId) {
      query.challengeId = new Types.ObjectId(challengeId);
    }

    return this.submissionModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  /**
   * Get single submission
   */
  async getSubmissionDetail(
    userId: string,
    submissionId: string,
  ): Promise<Submission> {
    // First, find if the submission exists at all
    const submission = await this.submissionModel.findById(submissionId);

    // If it doesn't exist, throw 404
    if (!submission) {
      throw new HttpException('Submission not found', HttpStatus.NOT_FOUND);
    }
    return submission;
  }
}
