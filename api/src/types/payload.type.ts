import { Role } from '@/common/enums';

export type Payload = {
  sub: string;
  tokenVersion: number;
  jti: string;
  role: Role;
};

export type ResetPasswordPayload = {
  sub: string;
  email: string;
};
