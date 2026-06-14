import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsMongoId,
  IsIn,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class ExecuteCodeDto {
  @IsMongoId()
  @IsNotEmpty()
  challengeId!: string; // Challenge ID

  @IsString()
  @IsNotEmpty()
  @MaxLength(100000)
  code!: string;

  @IsString()
  @IsOptional()
  @MaxLength(50000)
  input?: string;

  @IsString()
  @IsOptional()
  @IsIn([
    'cpp',
    'c',
    'python',
    'javascript',
    'java',
    'ruby',
    'go',
    'rust',
    'typescript',
  ])
  language?: string; // Default: cpp

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  timeout?: number; // seconds, default: 5
}

