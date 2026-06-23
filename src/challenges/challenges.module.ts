import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChallengesController } from './challenges.controller';
import { ChallengeService } from './challenges.service';
import { StorageService } from './storage.service';
import { Challenges, ChallengeSchema } from './schema/challenges.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Challenges.name, schema: ChallengeSchema },
    ]),
  ],
  controllers: [ChallengesController],
  providers: [ChallengeService, StorageService],
  exports: [ChallengeService],
})
export class ChallengesModule {}
