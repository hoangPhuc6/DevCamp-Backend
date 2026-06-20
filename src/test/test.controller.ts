import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TestService } from './test.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { SubmitAssessmentDto } from './dto/submit.dto';

@Controller('assessment')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get('questions') // GET /assessment/questions?challengeId=...
  getQuestions(@Query('challengeId') challengeId: string) {
    return this.testService.getQuestions(challengeId);
  }

  @Post('submissions')
  @UseGuards(JwtAuthGuard)
  postSubmissions(@Request() req: any, @Body() body: SubmitAssessmentDto) {
    return this.testService.postSubmissions({
      ...body,
      userId: req.user.subject,
    });
  }

  @Get('results') // GET /assessment/results?challengeId=...
  getResults(@Query('challengeId') challengeId: string) {
    return this.testService.getResults(challengeId);
  }
}
