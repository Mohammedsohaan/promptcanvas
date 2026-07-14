"use client";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthFooter } from "@/components/auth/auth-footer";

const loginFields = [
  {
    name: "email",
    label: "Email",
    type: "email" as const,
    placeholder: "you@example.com",
    autoComplete: "email",
  },
  {
    name: "password",
    label: "Password",
    type: "password" as const,
    placeholder: "Enter your password",
    autoComplete: "current-password",
  },
];

export default function LoginPage() {
  return (
    <AuthCard>
      <AuthHeader
        heading="Welcome back"
        subtitle="Sign in to your PromptCanvas workspace"
      />

      <AuthForm fields={loginFields} submitLabel="Sign in" />

      <AuthDivider label="new here?" />

      <AuthFooter
        message="Don't have an account?"
        linkText="Create account"
        linkHref="/signup"
      />
    </AuthCard>
  );
}
