import type { Metadata } from "next";

import { SignupForm } from "@/components/features/auth/signup-form";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default function SignupPage() {
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return <SignupForm googleEnabled={googleEnabled} />;
}
