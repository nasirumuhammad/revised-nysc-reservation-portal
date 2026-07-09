import { IsEmail, IsNotEmpty, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class SignInDto {
  @IsEmail()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email!: string;

  @IsNotEmpty()
  @Transform(({ value }) => String(value).trim())
  password!: string;
}
