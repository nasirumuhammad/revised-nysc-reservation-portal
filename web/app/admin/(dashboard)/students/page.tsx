import type { Metadata } from "next";
import { StudentsPage } from "../../components/table/students-table";

export const metadata: Metadata = {
  title: "Students | NYSC Verification Portal",
};

export default function Page() {
  return <StudentsPage />;
}
