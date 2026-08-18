import { Suspense } from "react";
import VerifyOtpForm from "../../components/forms/verify-otp-form";
import { AuthLayout } from "../../components/authlayout";
import { FormSkeleton } from "../../components/form-skeleton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify OTP | NYSC Management Portal",
};

const Page = () => {
  return (
    <AuthLayout>
      <Suspense fallback={<FormSkeleton />}>
        <VerifyOtpForm />
      </Suspense>
    </AuthLayout>
  );
};

export default Page;
