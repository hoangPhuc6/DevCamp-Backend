import { IsString, MinLength, IsEmail } from 'class-validator';
export class UpdateProfile {
  @IsEmail()
  email!: string;
  @IsString()
  @MinLength(2)
  displayName!: string;
}
