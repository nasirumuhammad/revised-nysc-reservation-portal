import type { Metadata } from "next";
import { DepartmentsPage } from "../../components/table/department-table";

export const metadata: Metadata = {
  title: "Departments | NYSC Verification Portal",
};

export default function Page() {
  return <DepartmentsPage />;
}
