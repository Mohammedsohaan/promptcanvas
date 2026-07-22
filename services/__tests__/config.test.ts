import { supabaseConfig } from "../../lib/supabase/config";

describe("Supabase Config Validator", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should return validated values if env variables are present", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "abc-key";

    expect(supabaseConfig.url).toBe("https://example.supabase.co");
    expect(supabaseConfig.publishableKey).toBe("abc-key");
  });

  it("should throw a descriptive error if NEXT_PUBLIC_SUPABASE_URL is missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "abc-key";

    expect(() => supabaseConfig.url).toThrow("Environment variable 'NEXT_PUBLIC_SUPABASE_URL' is missing.");
  });

  it("should throw a descriptive error if NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    expect(() => supabaseConfig.publishableKey).toThrow("Environment variable 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY' is missing.");
  });
});
