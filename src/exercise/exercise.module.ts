import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './exercise.service';
import {
  Challenge,
  ChallengeSchema,
  Submission,
  SubmissionSchema,
} from './exercise.schemas';
import {
  UserRoadmap,
  UserRoadmapSchema,
  RoadmapTemplate,
  RoadmapTemplateSchema,
} from '../roadmap/roadmap.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Challenge.name, schema: ChallengeSchema },
      { name: Submission.name, schema: SubmissionSchema },

      { name: UserRoadmap.name, schema: UserRoadmapSchema },
      { name: RoadmapTemplate.name, schema: RoadmapTemplateSchema },
    ]),
  ],
  controllers: [ExerciseController],
  providers: [ExerciseService],
  exports: [ExerciseService],
})
export class ExerciseModule {}
