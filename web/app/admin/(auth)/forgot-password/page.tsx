import { AuthLayout } from "../../components/authlayout";
import ForgotPasswordForm from "../../components/forms/forgot-password-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | NYSC Management Portal",
};
const Page = () => {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
};

export default Page;
