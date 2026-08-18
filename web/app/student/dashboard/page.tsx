import type { Metadata } from "next";
import { StudentProfileView } from "../(auth)/components/student-profile-preview";

export const metadata: Metadata = {
  title: "My Profile | NYSC Verification Portal",
};

export default function Page() {
  return <StudentProfileView />;
}
