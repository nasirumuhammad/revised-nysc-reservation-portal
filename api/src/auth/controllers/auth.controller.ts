import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { SignInDto } from '../dto/signin.dto';
import { SignInResponse } from '../types/response.type';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { Payload } from '@/types/payload.type';
import { JwtGuard } from '../guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('signin/admin')
  adminSignIn(@Body() payload: SignInDto): Promise<string> {
    return this.authService.signin(payload);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin/student')
  studentSignIn(@Body() payload: SignInDto): Promise<SignInResponse> {
    return this.authService.signinStudent(payload);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refresh(
    @Request() req: { user: Payload & { refreshToken: string } },
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.refresh(req.user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signout')
  @UseGuards(JwtGuard)
  signout(@Request() req: { user: Payload }): Promise<{ message: string }> {
    return this.authService.signout(req.user.sub);
  }
}
