import { createClient } from "@/lib/supabase/client";

/* ─────────── Types ─────────── */

export interface AuthResult {
  success: boolean;
  message: string;
  requiresEmailConfirmation?: boolean;
}

export interface SignupData {
  fullName: string;
  email: string;
  password: string;
}

/* ─────────── Error mapping ─────────── */

const ERROR_MESSAGES: Record<string, string> = {
  "User already registered": "An account with this email already exists. Please sign in instead.",
  "Password should be at least 6 characters": "Password must be at least 6 characters long.",
  "Unable to validate email address: invalid format": "Please enter a valid email address.",
  "Signup requires a valid password": "Please enter a valid password.",
  "Email rate limit exceeded": "Too many signup attempts. Please try again later.",
  "For security purposes, you can only request this after": "Please wait a moment before trying again.",
  "Invalid login credentials": "Invalid email or password. Please try again.",
  "Email not confirmed": "Please verify your email address before signing in.",
};

function getReadableError(message: string): string {
  // Check for exact match first
  if (ERROR_MESSAGES[message]) return ERROR_MESSAGES[message];

  // Check for partial match
  for (const [key, readable] of Object.entries(ERROR_MESSAGES)) {
    if (message.toLowerCase().includes(key.toLowerCase())) return readable;
  }

  // Fallback
  return message || "Something went wrong. Please try again.";
}

/* ─────────── Signup ─────────── */

export async function signUp({ fullName, email, password }: SignupData): Promise<AuthResult> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return {
      success: false,
      message: getReadableError(error.message),
    };
  }

  // Supabase returns a user with identities = [] when email confirmation is
  // enabled and the email is already registered (as a security measure to
  // prevent email enumeration). Handle this gracefully.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return {
      success: false,
      message: "An account with this email already exists. Please sign in instead.",
    };
  }

  // Check if email confirmation is required
  // When confirmation is required, session will be null
  const requiresEmailConfirmation = !data.session;

  return {
    success: true,
    requiresEmailConfirmation,
    message: requiresEmailConfirmation
      ? "Account created! Please check your email to verify your account before signing in."
      : "Account created successfully! Redirecting to login...",
  };
}

/* ─────────── Login ─────────── */

export interface LoginData {
  email: string;
  password: string;
}

export async function signIn({ email, password }: LoginData): Promise<AuthResult> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      message: getReadableError(error.message),
    };
  }

  return {
    success: true,
    message: "Signed in successfully!",
  };
}
