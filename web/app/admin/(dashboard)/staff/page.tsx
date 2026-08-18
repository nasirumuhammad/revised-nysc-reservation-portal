import type { Metadata } from "next";
import { StaffPage } from "../../components/table/staffs-table";

export const metadata: Metadata = {
  title: "Staff | NYSC Verification Portal",
};

export default function Page() {
  return <StaffPage />;
}
