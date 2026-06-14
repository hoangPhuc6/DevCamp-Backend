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
    @Request() req: any,
    @Body() executeCodeDto: ExecuteCodeDto,
  ) {
    return this.codeExecutionService.executeCode(req.user.id, executeCodeDto);
  }

  /**
   * GET /code-execution/submissions
   * Get submissions for user (optionally filtered by challenge)
   */
  @Get('submissions')
  @UseGuards(JwtAuthGuard)
  async getSubmissions(
    @Request() req: any,
    @Query('challengeId') challengeId?: string,
    @Query('limit') limit: string = '10',
    @Query('skip') skip: string = '0',
  ) {
    return this.codeExecutionService.getSubmissions(
      req.user.id,
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
    @Request() req: any,
    @Param('submissionId') submissionId: string,
  ) {
    return this.codeExecutionService.getSubmissionDetail(
      req.user.id,
      submissionId,
    );
  }
}
