import { Transform } from 'class-transformer';
import { IsEmpty, IsJWT, IsNotEmpty, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsJWT({ message: 'Invalid token' })
  @IsNotEmpty()
  @Transform(({ value }) => String(value).trim())
  token!: string;

  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,16}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  @Transform(({ value }) => String(value).trim())
  password!: string;
}
