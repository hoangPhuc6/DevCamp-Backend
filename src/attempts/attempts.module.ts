import { Module } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { AttemptsController } from './attempts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Attempt, AttemptSchema } from './schema/attempt.schema';
import {
  AttemptAnswer,
  AttemptAnswerSchema,
} from './schema/attemptAnswer.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attempt.name, schema: AttemptSchema },
      { name: AttemptAnswer.name, schema: AttemptAnswerSchema },
    ]),
  ],
  controllers: [AttemptsController],
  providers: [AttemptsService],
  exports: [AttemptsService],
})
export class AttemptsModule {}
