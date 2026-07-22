/**
 * Supabase configuration validator helper.
 * Uses lazy getters to avoid breaking static generation during build phase
 * when environment variables are not populated.
 */
function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable '${name}' is missing. Please verify your environment configuration.`);
  }
  return value;
}

export const supabaseConfig = {
  get url(): string {
    return getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  },
  get publishableKey(): string {
    return getRequiredEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  },
};
