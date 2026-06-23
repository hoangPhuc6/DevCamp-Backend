import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Param,
  Query,
} from '@nestjs/common';
import { CodeExecutionService } from './code-execution.service';
import { ExecuteCodeDto } from './dto/execute-code.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

interface RequestWithUser {
  user: {
    id?: string;
    _id?: string;
    subject?: string;
  };
}

@Controller('code-execution')
export class CodeExecutionController {
  constructor(private readonly codeExecutionService: CodeExecutionService) {}

  /**
   * POST /code-execution/execute
   * Execute code via Piston API
   */
  @Post('execute')
  @UseGuards(JwtAuthGuard)
  async executeCode(
    @Request() req: RequestWithUser,
    @Body() executeCodeDto: ExecuteCodeDto,
  ) {
    const userId = req.user.id || req.user._id || req.user.subject;
    return this.codeExecutionService.executeCode(
      userId as string,
      executeCodeDto,
    );
  }

  /**
   * GET /code-execution/submissions
   * Get submissions for user (optionally filtered by challenge)
   */
  @Get('submissions')
  @UseGuards(JwtAuthGuard)
  async getSubmissions(
    @Request() req: RequestWithUser,
    @Query('challengeId') challengeId?: string,
    @Query('limit') limit: string = '10',
    @Query('skip') skip: string = '0',
  ) {
    const userId = req.user.id || req.user._id || req.user.subject;
    return this.codeExecutionService.getSubmissions(
      userId as string,
      challengeId,
      parseInt(limit),
      parseInt(skip),
    );
  }

  /**
   * GET /code-execution/:submissionId
   * Get single submission details
   */
  @Get(':submissionId')
  @UseGuards(JwtAuthGuard)
  async getSubmissionDetail(
    @Request() req: RequestWithUser,
    @Param('submissionId') submissionId: string,
  ) {
    const userId = req.user.id || req.user._id || req.user.subject;
    return this.codeExecutionService.getSubmissionDetail(
      userId as string,
      submissionId,
    );
  }
}
