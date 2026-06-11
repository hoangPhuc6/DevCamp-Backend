import { IsString, IsOptional } from 'class-validator';
export class UpdateAttemptDto {
  @IsString()
  @IsOptional()
  code?: string;
}
