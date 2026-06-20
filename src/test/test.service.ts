import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TestCase, TestSubmission } from './test.schemas';

@Injectable()
export class TestService {
  constructor(
    @InjectModel(TestCase.name) private readonly testCaseModel: Model<TestCase>,
    @InjectModel(TestSubmission.name)
    private readonly testSubmissionModel: Model<TestSubmission>,
  ) {}

  // Return list of questions for a given challengeId, only including those that are active and of displayable types (sample, multiple-choice, essay)
  async getQuestions(challengeId: string) {
    if (!Types.ObjectId.isValid(challengeId)) {
      throw new BadRequestException(
        'Invalid challengeId format. Must be a valid MongoDB ObjectId string.',
      );
    }

    const questions = await this.testCaseModel
      .find({
        challengeId: new Types.ObjectId(challengeId),
        isActive: true,
        type: { $in: ['sample', 'multiple-choice', 'essay'] },
      })
      .select('input expectedOutput type options')
      .exec();

    return {
      challengeId,
      totalQuestions: questions.length,
      questions: questions,
    };
  }

  // Process user submissions for a given challengeId, compare with expected outputs, calculate score, and save the submission record
  async postSubmissions(body: {
    challengeId: string;
    userId?: string;
    userCodeOutput: string[]; // Expected output (can be blank)
  }) {
    const { challengeId, userId, userCodeOutput } = body;

    if (!challengeId || !userCodeOutput || !Array.isArray(userCodeOutput)) {
      throw new BadRequestException(
        'Invalid request body. Required: { challengeId: string, userCodeOutput: string[] }',
      );
    }

    const allTestCases = await this.testCaseModel
      .find({ challengeId: new Types.ObjectId(challengeId), isActive: true })
      .exec();

    if (!allTestCases || allTestCases.length === 0) {
      throw new NotFoundException(
        'Not found any active test cases for the given challengeId',
      );
    }

    let passedCount = 0;
    let scoreableQuestionsCount = 0;
    const details: any[] = [];

    allTestCases.forEach((testcase, index) => {
      const userSingleOutput = userCodeOutput[index]?.trim() || '';
      const expected = testcase.expectedOutput?.trim();

      let isCorrect = false;
      let status = 'Failed';

      // Type of test case:
      if (testcase.type === 'essay') {
        isCorrect = true;
        status = 'Submitted';
      } else {
        isCorrect = userSingleOutput === expected;
        status = isCorrect ? 'Passed' : 'Failed';
        scoreableQuestionsCount++;
        if (isCorrect) passedCount++;
      }

      details.push({
        testCaseId: testcase._id,
        type: testcase.type,
        status: status,
        input: testcase.type !== 'hidden' ? testcase.input : 'Hidden Test Case',
        expected: testcase.type !== 'hidden' ? expected : 'Hidden Test Case',
        actual:
          testcase.type !== 'hidden'
            ? userSingleOutput
            : isCorrect
              ? 'Match'
              : 'Mismatch',
      });
    });

    const totalToDivide =
      scoreableQuestionsCount > 0
        ? scoreableQuestionsCount
        : allTestCases.length;
    const scorePercentage = Math.round((passedCount / totalToDivide) * 100);

    await this.testSubmissionModel.create({
      userId: userId ? new Types.ObjectId(userId) : undefined,
      challengeId: new Types.ObjectId(challengeId),
      userAnswers: userCodeOutput, // Save user outputs for reference
      score: scorePercentage,
      status: 'Completed',
    });

    return {
      challengeId,
      status: scorePercentage === 100 ? 'Accepted' : 'Completed',
      score: scorePercentage,
      passed: `${passedCount}/${allTestCases.length}`,
      details,
    };
  }

  // Return summary of test cases for a given challengeId, grouped by type (sample, hidden, stress, generated, multiple-choice, essay) and count of each type
  async getResults(challengeId: string) {
    if (!Types.ObjectId.isValid(challengeId)) {
      throw new BadRequestException('Invalid challengeId format');
    }

    const summary = await this.testCaseModel.aggregate([
      {
        $match: {
          challengeId: new Types.ObjectId(challengeId),
          isActive: true,
        },
      },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    return {
      challengeId,
      message: 'Test case summary by type for the given challengeId',
      summary,
    };
  }
}
