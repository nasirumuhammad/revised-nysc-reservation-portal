import { ClassOfDegree, Gender, Marital_status } from "@nysc/enums";
import { User } from "./user";

export type Student = User & {
  class_of_degree: ClassOfDegree;
  dateOfGraduation: string;
  DOB: string;
  gender: Gender;
  maritalStatus: Marital_status;
  jambRegNumber: string;
  isMilitary: boolean;
  registrationNumber: string;
  course: string;
  state: string;
};
