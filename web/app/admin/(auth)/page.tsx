import { AuthLayout } from "../components/authlayout";
import FormHeading from "@/components/form-heading";
import SignInForm from "../components/forms/signin-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Sign In | NYSC Management Portal",
};

const Page = () => {
  return (
    <AuthLayout>
      <FormHeading
        heading=" Admin Sign In"
        subHeading="  NYSC Management Portal"
      />
      <SignInForm />
    </AuthLayout>
  );
};

export default Page;
