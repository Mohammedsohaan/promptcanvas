"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

/* ─────────── Types ─────────── */

interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password";
  placeholder: string;
  autoComplete?: string;
}

export interface AuthFormResult {
  type: "success" | "error";
  message: string;
  redirect?: string;
}

interface AuthFormProps {
  fields: FormField[];
  submitLabel: string;
  onSubmit?: (data: Record<string, string>) => Promise<AuthFormResult | void> | void;
}

/* ─────────── Feedback Banner ─────────── */

interface FeedbackBannerProps {
  type: "success" | "error";
  message: string;
}

function FeedbackBanner({ type, message }: FeedbackBannerProps) {
  const styles = {
    success:
      "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
    error:
      "border-red-500/20 bg-red-500/5 text-red-400",
  };

  const Icon = type === "success" ? CheckCircle2 : AlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium",
        styles[type]
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </motion.div>
  );
}

/* ─────────── Validation ─────────── */

function validateField(name: string, value: string, allValues: Record<string, string>): string {
  if (!value.trim()) return "This field is required";

  switch (name) {
    case "email":
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "Please enter a valid email address";
      break;
    case "password":
      if (value.length < 8) return "Password must be at least 8 characters";
      break;
    case "confirmPassword":
      if (value !== allValues.password) return "Passwords do not match";
      break;
    case "fullName":
      if (value.trim().length < 2) return "Name must be at least 2 characters";
      break;
  }

  return "";
}

/* ─────────── Password toggle input ─────────── */

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn(
            "pr-10",
            error && "border-red-500/40 focus-visible:ring-red-500/30",
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-sm"
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

/* ─────────── Main Form ─────────── */

export function AuthForm({ fields, submitLabel, onSubmit }: AuthFormProps) {
  const router = useRouter();
  const [values, setValues] = React.useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.name, ""]))
  );
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [feedback, setFeedback] = React.useState<FeedbackBannerProps | null>(null);

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));

    // Clear error on change if field was touched
    if (touched[name]) {
      const error = validateField(name, value, { ...values, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: error }));
    }

    // Clear feedback when user types
    if (feedback) setFeedback(null);
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name], values);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};

    fields.forEach((field) => {
      newTouched[field.name] = true;
      const error = validateField(field.name, values[field.name], values);
      if (error) newErrors[field.name] = error;
    });

    setTouched(newTouched);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      if (onSubmit) {
        const result = await onSubmit(values);
        if (result) {
          setFeedback({ type: result.type, message: result.message });

          // Redirect after a brief delay on success (if redirect path provided)
          if (result.type === "success" && result.redirect) {
            setTimeout(() => router.push(result.redirect!), 2000);
          }
        }
      }
    } catch {
      setFeedback({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 mt-8"
      noValidate
    >
      {/* Feedback banner */}
      {feedback && <FeedbackBanner type={feedback.type} message={feedback.message} />}

      {/* Form fields */}
      {fields.map((field) => {
        const hasError = touched[field.name] && !!errors[field.name];
        const isPassword = field.type === "password";

        return (
          <div key={field.name} className="flex flex-col gap-1.5">
            <label
              htmlFor={field.name}
              className="text-sm font-medium text-white/60"
            >
              {field.label}
            </label>

            {isPassword ? (
              <PasswordInput
                id={field.name}
                name={field.name}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                value={values[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                onBlur={() => handleBlur(field.name)}
                error={hasError}
                disabled={isLoading}
              />
            ) : (
              <Input
                id={field.name}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                value={values[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                onBlur={() => handleBlur(field.name)}
                className={cn(
                  hasError && "border-red-500/40 focus-visible:ring-red-500/30"
                )}
                disabled={isLoading}
              />
            )}

            {/* Error message */}
            {hasError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 font-medium"
              >
                {errors[field.name]}
              </motion.p>
            )}
          </div>
        );
      })}

      {/* Submit button */}
      <Button
        type="submit"
        size="lg"
        disabled={isLoading}
        className="w-full mt-2 h-12 text-sm font-semibold"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Please wait...</span>
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </motion.form>
  );
}
