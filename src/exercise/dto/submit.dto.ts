import { IsString, MinLength } from 'class-validator';

export class SubmitExerciseDto {
  @IsString()
  language: string;

  @IsString()
  @MinLength(1)
  code: string;
}
