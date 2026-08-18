import { Suspense } from "react";
import { AuthLayout } from "../../components/authlayout";
import FormHeading from "@/components/form-heading";
import ResetPasswordForm from "../../components/forms/reset-password-form";
import { FormSkeleton } from "../../components/form-skeleton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | NYSC Management Portal",
};

const Page = () => {
  return (
    <AuthLayout>
      <FormHeading
        heading="Set a new password"
        subHeading="Choose a strong password for your account."
      />
      <Suspense fallback={<FormSkeleton />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
};

export default Page;
