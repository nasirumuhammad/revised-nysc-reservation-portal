import { Metadata } from "next";
import { AuthLayout } from "../../components/authlayout";
import VerifySigninOtpForm from "../../components/forms/verify-login-form";
import { Suspense } from "react";
import { FormSkeleton } from "../../components/form-skeleton";

export const metadata: Metadata = {
  title: "Verify Login | NYSC Management Portal",
};
const Page = () => {
  return (
    <AuthLayout>
      <Suspense fallback={<FormSkeleton />}>
        <VerifySigninOtpForm />
      </Suspense>
    </AuthLayout>
  );
};

export default Page;
