import { IsString, IsNotEmpty } from 'class-validator';
export class CreateAttemptDto {
  @IsString()
  @IsNotEmpty()
  language!: string;
}
