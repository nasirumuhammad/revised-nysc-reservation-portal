import { Purpose } from '@/otp/otp.service';
import { User } from '@/user/entity/user.entity';

export const SystemEvents = {
  USER_LOGIN: 'auth.user-logged-in',
  RESEND_OTP: 'otp.resend-requested',
  SEND_FORGOT_PASSWORD_OTP: 'auth.forgot-password-otp-requested',
} as const;

export type SystemEvent = (typeof SystemEvents)[keyof typeof SystemEvents];

export class UserLoginEventPayload {
  constructor(public readonly user: User) {}
}

export class ResendOtpEventPayload {
  constructor(
    public readonly email: string,
    public readonly purpose: Purpose,
  ) {}
}

export class ForgotPasswordOtpEventPayload {
  constructor(public readonly email: string) {}
}
