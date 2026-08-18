import { Role } from "./role";

export type Payload = {
  sub: string;
  tokenVersion: number;
  jti: string;
  role: Role;
};
