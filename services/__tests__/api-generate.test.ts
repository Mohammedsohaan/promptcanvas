import { POST } from "@/app/api/ai/generate/route";
import { createClient } from "@/lib/supabase/server";
import { generateContent } from "@/services/ai";
import { NextRequest } from "next/server";

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

jest.mock("@/services/ai", () => ({
  generateContent: jest.fn(),
}));

describe("AI Generate API Route Handler", () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
    };
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  function makeMockRequest(body: any): NextRequest {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  }

  it("should return 401 if user is unauthorized", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "No session" },
    });

    const req = makeMockRequest({});
    const res = await POST(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("Unauthorized");
  });

  it("should return 400 if prompt is missing", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    const req = makeMockRequest({
      projectId: "proj-1",
      documentId: "doc-1",
      provider: "openai",
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("prompt");
  });

  it("should return 400 if invalid provider is passed", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    const req = makeMockRequest({
      prompt: "Generate PRD",
      projectId: "proj-1",
      documentId: "doc-1",
      provider: "invalid-provider",
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("provider");
  });

  it("should generate content successfully with correct inputs", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    (generateContent as jest.Mock).mockResolvedValue({
      provider: "openai",
      text: "Mocked AI Response",
      model: "gpt-5",
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
    });

    const req = makeMockRequest({
      prompt: "Generate PRD",
      projectId: "proj-1",
      documentId: "doc-1",
      provider: "openai",
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.content).toBe("Mocked AI Response");
    expect(body.provider).toBe("openai");
  });

  it("should propagate provider failure errors correctly", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    (generateContent as jest.Mock).mockRejectedValue(new Error("Provider not implemented"));

    const req = makeMockRequest({
      prompt: "Generate PRD",
      projectId: "proj-1",
      documentId: "doc-1",
      provider: "openai",
    });
    const res = await POST(req);

    expect(res.status).toBe(501); // Not Implemented
    const body = await res.json();
    expect(body.error).toBe("Provider not implemented");
  });
});
