"use client";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthForm, type AuthFormResult } from "@/components/auth/auth-form";
import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthFooter } from "@/components/auth/auth-footer";
import { signIn } from "@/services/auth";

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

async function handleLogin(data: Record<string, string>): Promise<AuthFormResult> {
  const result = await signIn({
    email: data.email,
    password: data.password,
  });

  if (!result.success) {
    return { type: "error", message: result.message };
  }

  return {
    type: "success",
    message: result.message,
    redirect: "/dashboard",
  };
}

export default function LoginPage() {
  return (
    <AuthCard>
      <AuthHeader
        heading="Welcome back"
        subtitle="Sign in to your PromptCanvas workspace"
      />

      <AuthForm
        fields={loginFields}
        submitLabel="Sign in"
        onSubmit={handleLogin}
      />

      <AuthDivider label="new here?" />

      <AuthFooter
        message="Don't have an account?"
        linkText="Create account"
        linkHref="/signup"
      />
    </AuthCard>
  );
}
