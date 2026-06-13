import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { UpdateAttemptDto } from './dto/update-attempt.dto';
import { CreateAttemptQuizzDto } from './dto/create-attempt-quizz.dto';
import { Attempt, AttemptDocument } from './schema/attempt.schema';
import {
  AttemptAnswer,
  AttemptAnswerDocument,
} from './schema/attemptAnswer.schema';
import { Model, isValidObjectId } from 'mongoose';
@Injectable()
export class AttemptsService {
  constructor(
    @InjectModel(Attempt.name)
    private readonly attemptModel: Model<AttemptDocument>,
    @InjectModel(AttemptAnswer.name)
    private readonly attemptAnswerModel: Model<AttemptAnswerDocument>,
  ) {}
  // CODING FLOW FOR ATTEMPTS
  async createAttempt(
    dto: CreateAttemptDto,
    challengeId: string,
    userId: string,
  ) {
    // Create a new attempt document
    const newAttempt = new this.attemptModel({
      user: userId,
      challenge: challengeId,
      status: 'in progress',
      startedAt: new Date(),
    });

    return newAttempt.save();
  }

  async getAttemptsForExercise(challengeId: string, userId: string) {
    return this.attemptModel
      .find({ challenge: challengeId, user: userId })
      .sort({ startedAt: -1 }); // Sort attempts by most recent first
  }

  async updateAttempt(
    attemptId: string,
    dto: UpdateAttemptDto,
    userId: string,
  ) {
    // isValidObjectId is a function from mongoose that checks valitedity of the attemptId before query.
    if (!isValidObjectId(attemptId)) {
      throw new NotFoundException('Attempt not found');
    }

    const attempt = await this.attemptModel.findOne({
      _id: attemptId,
      user: userId,
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    // Check the status from the database
    if (attempt.status !== 'in progress') {
      throw new BadRequestException(
        'Cannot update code for an attempt that is not in progress',
      );
    }

    // If code is not undefinfed, update currentCode
    if (dto.code !== undefined) {
      attempt.currentCode = dto.code;
      attempt.runCount += 1; // Increment run count each time code is updated
    }

    // If status is not undefined, assignment value to attempt.status(field)
    if (dto.status !== undefined) {
      attempt.status = dto.status;
      // If the status is updated to 'completed' or 'failed', set the completedAt
      if (dto.status === 'completed' || dto.status === 'failed') {
        attempt.completedAt = new Date(); // Set time of completion when status changes to completed or failed
      }
    }

    return attempt.save();
  }

  // QUIZ FLOW FOR ATTEMPTS
  async createQuizAttempt(
    dto: CreateAttemptQuizzDto,
    challengeId: string,
    userId: string,
  ) {
    // For questions both of quiz and small code. Store all the answers in the AttemptAnswer collection for easier analytics and gen roadmap insights.
    const createQuizAttempt = await this.attemptAnswerModel.findOneAndUpdate(
      {
        // Find an existing attempt answer for the same user, exercise, and question
        user: userId,
        challenge: challengeId, // This is challengeId
        questionId: dto.questionId,
      },
      {
        // If an attempt answer exists, update the userAnswer and selectedOptions
        $set: {
          userAnswer: dto.selected,
          selectedOptions: [dto.selected], // Store the selected option in an array for consistency, even if it's a single choice
        },
        // If don't exist, create a new attempt answer with the provided details
        $setOnInsert: {
          startedAt: new Date(),
        },
        // new: true to return the updated document, upsert: true to create if it doesn't exist
      },
      { new: true, upsert: true },
    );
    return createQuizAttempt;
  }
}
