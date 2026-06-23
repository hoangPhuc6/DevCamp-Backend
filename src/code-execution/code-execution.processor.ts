import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job } from 'bullmq';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Submission } from './schema/submission.schema';
import { Logger } from '@nestjs/common';

@Processor('code-execution')
export class CodeExecutionProcessor extends WorkerHost {
  private readonly logger = new Logger(CodeExecutionProcessor.name);

  // Language mapping for Piston API
  private readonly languageMap: Record<string, string> = {
    cpp: 'c++',
    c: 'c',
    python: 'python3',
    javascript: 'javascript',
    java: 'java',
    ruby: 'ruby',
    go: 'go',
    rust: 'rust',
    typescript: 'typescript',
  };

  constructor(
    @InjectModel(Submission.name)
    private submissionModel: Model<Submission>,
    private configService: ConfigService,
  ) {
    super();
  }

  private get pistonApiUrl(): string {
    return (
      this.configService.get<string>('PISTON_API_URL') ||
      'https://emkc.org/api/v2/piston/execute'
    );
  }

  async process(
    job: Job<
      {
        submissionId: string;
        code: string;
        input: string;
        language: string;
        timeout: number;
      },
      any,
      string
    >,
  ): Promise<any> {
    const { submissionId, code, input, language, timeout } = job.data;
    const pistonLanguage =
      this.languageMap[language] || this.languageMap['cpp'];

    this.logger.log(`Processing execution for submission: ${submissionId}`);

    const submission = await this.submissionModel.findById(submissionId);
    if (!submission) {
      this.logger.error(`Submission not found: ${submissionId}`);
      return;
    }

    try {
      const startTime = Date.now();

      const response = await axios.post<{
        run?: {
          stdout?: string;
          stderr?: string;
          output?: string;
          code?: number;
          signal?: string | null;
        };
        compile?: {
          stdout?: string;
          stderr?: string;
          output?: string;
          code?: number;
          signal?: string | null;
        };
      }>(
        this.pistonApiUrl,
        {
          language: pistonLanguage,
          version: '*',
          files: [
            {
              name: this.getFileName(pistonLanguage),
              content: code,
            },
          ],
          stdin: input || '',
          run_timeout: timeout * 1000,
        },
        {
          timeout: (timeout + 10) * 1000,
        },
      );

      const runtime = Date.now() - startTime;
      const result = response.data;

      let output = '';
      let error = '';
      let statusCode = 0;

      if (result.compile && result.compile.code !== 0) {
        output = result.compile.stdout || '';
        error =
          result.compile.stderr || result.compile.output || 'Compilation error';
        statusCode = result.compile.code ?? 1;
      } else if (result.run) {
        output = result.run.stdout || '';
        error = result.run.stderr || '';
        statusCode = result.run.code ?? 0;
      }

      submission.output = output;
      submission.error = error;
      submission.statusCode = statusCode;
      submission.runtime = runtime;
      submission.status = statusCode === 0 ? 'success' : 'error';

      await submission.save();
      this.logger.log(
        `Execution completed for: ${submissionId} with status: ${submission.status}`,
      );

      return { status: submission.status, statusCode };
    } catch (error) {
      this.logger.error(`Execution failed for ${submissionId}`, error);

      submission.status = 'error';
      if (axios.isAxiosError<{ message?: string }>(error)) {
        submission.error =
          error.response?.data?.message || error.message || 'Execution failed';
      } else {
        submission.error =
          error instanceof Error ? error.message : 'Execution failed';
      }

      await submission.save();
      throw error;
    }
  }

  private getFileName(language: string): string {
    const fileExtensions: Record<string, string> = {
      cpp: 'main.cpp',
      c: 'main.c',
      python3: 'main.py',
      javascript: 'main.js',
      java: 'Main.java',
      ruby: 'main.rb',
      go: 'main.go',
      rust: 'main.rs',
      typescript: 'main.ts',
    };
    return fileExtensions[language] || 'main.txt';
  }
}
