import { signUp, signIn } from "../auth";
import { createClient } from "@/lib/supabase/client";

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(),
}));

describe("Auth Service", () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = {
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
      },
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe("signUp", () => {
    it("should sign up successfully without email confirmation required", async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: "user-123", identities: [{ id: "identity-1" }] },
          session: { access_token: "token" },
        },
        error: null,
      });

      const result = await signUp({
        fullName: "Jane Doe",
        email: "jane@example.com",
        password: "securepassword",
      });

      expect(result.success).toBe(true);
      expect(result.requiresEmailConfirmation).toBe(false);
      expect(result.message).toContain("Redirecting to login");
    });

    it("should sign up successfully requiring email confirmation", async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: "user-123", identities: [{ id: "identity-1" }] },
          session: null,
        },
        error: null,
      });

      const result = await signUp({
        fullName: "Jane Doe",
        email: "jane@example.com",
        password: "securepassword",
      });

      expect(result.success).toBe(true);
      expect(result.requiresEmailConfirmation).toBe(true);
      expect(result.message).toContain("check your email to verify");
    });

    it("should fail signup if email is already registered (identities length 0)", async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: "user-123", identities: [] },
          session: null,
        },
        error: null,
      });

      const result = await signUp({
        fullName: "Jane Doe",
        email: "jane@example.com",
        password: "securepassword",
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("already exists");
    });

    it("should map common errors to readable error messages", async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "Password should be at least 6 characters" },
      });

      const result = await signUp({
        fullName: "Jane Doe",
        email: "jane@example.com",
        password: "123",
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Password must be at least 6 characters long.");
    });
  });

  describe("signIn", () => {
    it("should sign in successfully with valid credentials", async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      const result = await signIn({
        email: "jane@example.com",
        password: "securepassword",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("Signed in successfully");
    });

    it("should fail sign in with invalid credentials", async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: "Invalid login credentials" },
      });

      const result = await signIn({
        email: "jane@example.com",
        password: "wrongpassword",
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Invalid email or password. Please try again.");
    });
  });
});
