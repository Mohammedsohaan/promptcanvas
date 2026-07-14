"use client";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthFooter } from "@/components/auth/auth-footer";

const signupFields = [
  {
    name: "fullName",
    label: "Full Name",
    type: "text" as const,
    placeholder: "John Doe",
    autoComplete: "name",
  },
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
    placeholder: "Create a password",
    autoComplete: "new-password",
  },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    type: "password" as const,
    placeholder: "Confirm your password",
    autoComplete: "new-password",
  },
];

export default function SignupPage() {
  return (
    <AuthCard>
      <AuthHeader
        heading="Create your account"
        subtitle="Start planning smarter with PromptCanvas"
      />

      <AuthForm fields={signupFields} submitLabel="Create Account" />

      <AuthDivider label="already have an account?" />

      <AuthFooter
        message="Already have an account?"
        linkText="Sign in"
        linkHref="/login"
      />
    </AuthCard>
  );
}
