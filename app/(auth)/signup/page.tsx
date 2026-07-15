"use client";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthForm, type AuthFormResult } from "@/components/auth/auth-form";
import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthFooter } from "@/components/auth/auth-footer";
import { signUp } from "@/services/auth";

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

async function handleSignup(data: Record<string, string>): Promise<AuthFormResult> {
  const result = await signUp({
    fullName: data.fullName,
    email: data.email,
    password: data.password,
  });

  if (!result.success) {
    return { type: "error", message: result.message };
  }

  // If email confirmation is not required, redirect to login
  return {
    type: "success",
    message: result.message,
    redirect: result.requiresEmailConfirmation ? undefined : "/login",
  };
}

export default function SignupPage() {
  return (
    <AuthCard>
      <AuthHeader
        heading="Create your account"
        subtitle="Start planning smarter with PromptCanvas"
      />

      <AuthForm
        fields={signupFields}
        submitLabel="Create Account"
        onSubmit={handleSignup}
      />

      <AuthDivider label="already have an account?" />

      <AuthFooter
        message="Already have an account?"
        linkText="Sign in"
        linkHref="/login"
      />
    </AuthCard>
  );
}
