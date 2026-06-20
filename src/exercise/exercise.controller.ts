import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { SubmitExerciseDto } from './dto/submit.dto';

@Controller('exercises')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getExercises(@Request() req: any) {
    const userId = req.user.subject;
    return this.exerciseService.getExercises(userId);
  }

  @Get(':id')
  getExerciseById(@Param('id') id: string) {
    return this.exerciseService.getExerciseById(id);
  }

  @Post(':id')
  @UseGuards(JwtAuthGuard)
  postExercise(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: SubmitExerciseDto,
  ) {
    const userId = req.user.subject;
    return this.exerciseService.postExercise(userId, id, body);
  }
}
