import { IsJWT } from 'class-validator';

export class signoutDto {
  @IsJWT()
  refreshToken!: string;
}
