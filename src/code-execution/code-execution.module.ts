import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CodeExecutionService } from './code-execution.service';
import { CodeExecutionController } from './code-execution.controller';
import { Submission, SubmissionSchema } from './schema/submission.schema';
import { BullModule } from '@nestjs/bullmq';
import { CodeExecutionProcessor } from './code-execution.processor';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Submission.name,
        schema: SubmissionSchema,
      },
    ]),
    BullModule.registerQueue({
      name: 'code-execution',
    }),
  ],
  controllers: [CodeExecutionController],
  providers: [CodeExecutionService, CodeExecutionProcessor],
  exports: [CodeExecutionService],
})
export class CodeExecutionModule {}

