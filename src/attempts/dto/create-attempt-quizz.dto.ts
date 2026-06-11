import { IsNotEmpty, IsString } from 'class-validator';
export class CreateAttemptQuizzDto {
  @IsString()
  @IsNotEmpty()
  questionId!: string;

  @IsString()
  @IsNotEmpty()
  selected!: string;
}
