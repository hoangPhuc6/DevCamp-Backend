import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { TestModule } from './test/test.module';
import { RoadmapModule } from './roadmap/roadmap.module';
import { ExerciseModule } from './exercise/exercise.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('mongoUrl') ||
          'mongodb://localhost:27017/FESSIORDEVCAMP_BACKEND',
      }),
    }),

    UserModule,
    AuthModule,
    TestModule,
    RoadmapModule,
    ExerciseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
