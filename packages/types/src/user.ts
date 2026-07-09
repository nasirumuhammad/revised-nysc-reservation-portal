import { Role } from "@nysc/enums";

export type User = {
  id: string;
  first_name: string;
  middlename_name: string | null;
  surname: string;
  phone_number: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
};
