import { AuthLayout } from "@/app/admin/components/authlayout";
import { FormSkeleton } from "@/app/admin/components/form-skeleton";
import { Metadata } from "next";
import { Suspense } from "react";
import { StudentSigninForm } from "./components/student-sign-in-form";

export const metadata: Metadata = {
  title: "Verify OTP | NYSC Management Portal",
};

const Page = () => {
  return (
    <AuthLayout>
      <Suspense fallback={<FormSkeleton />}>
        <StudentSigninForm />
      </Suspense>
    </AuthLayout>
  );
};

export default Page;
