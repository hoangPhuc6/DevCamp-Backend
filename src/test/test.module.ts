import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestController } from './test.controller';
import { TestService } from './test.service';
import {
  TestCase,
  TestCaseSchema,
  TestSubmission,
  TestSubmissionSchema,
} from './test.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TestCase.name, schema: TestCaseSchema },
      { name: TestSubmission.name, schema: TestSubmissionSchema },
    ]),
  ],
  controllers: [TestController],
  providers: [TestService],
  exports: [TestService],
})
export class TestModule {}
