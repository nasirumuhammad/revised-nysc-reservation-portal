import { User } from "./index";
export type Staff = User & {
  staffId: string | null;
};
