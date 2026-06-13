import {
  Controller,
  Post,
  Get,
  Patch,
  HttpCode,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { UpdateAttemptDto } from './dto/update-attempt.dto';
import { CreateAttemptQuizzDto } from './dto/create-attempt-quizz.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
// define a interface for the request object that includes the user property populated by JwtAuthGuard
interface RequestWithUser extends Request {
  user: {
    _id: string;
  };
}

@Controller('exercises')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}
  // CODING FLOW FOR ATTEMPTS:
  // Endpoint to create a new attempt for a specific exercise
  @Post(':id/attempts')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated to create an attempt
  async createAttempt(
    @Body() createAttemptDto: CreateAttemptDto,
    @Param('id') challengeId: string,
    @Req() req: RequestWithUser, // req.user will be populated by JwtAuthGuard with the authenticated user's information
  ) {
    return this.attemptsService.createAttempt(
      createAttemptDto,
      challengeId,
      req.user._id,
    );
  }

  // Endpoint to retrieve all attempts for a specific exercise
  // :id is the exerciseId, not the attemptId
  @Get(':id/attempts')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated to view their attempts
  async getAttempts(
    @Param('id') challengeId: string,
    @Req() req: RequestWithUser,
  ) {
    // will return all attempts
    return this.attemptsService.getAttemptsForExercise(
      challengeId,
      req.user._id,
    );
  }

  // Endpoint to update an attempt's code and status
  @Patch(':id/attempts/:attemptId')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated to update their attempt
  async updateAttempt(
    @Param('attemptId') attemptId: string,
    @Param('id') challengeId: string,
    @Body() updateAttemptDto: UpdateAttemptDto,
    @Req() req: RequestWithUser,
  ) {
    // will update the attempt's code and status
    return this.attemptsService.updateAttempt(
      attemptId,
      updateAttemptDto,
      req.user._id,
    );
  }

  // QUIZ FLOW FOR ATTEMPTS:
  @Post(':id/attempts/quiz')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated to create a quiz attempt
  async createQuizAttempt(
    @Body() createAttemptQuizzDto: CreateAttemptQuizzDto,
    @Param('id') challengeId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.attemptsService.createQuizAttempt(
      createAttemptQuizzDto,
      challengeId,
      req.user._id,
    );
  }
}
