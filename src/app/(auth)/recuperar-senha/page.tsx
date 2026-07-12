import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/features/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Recuperar senha",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
