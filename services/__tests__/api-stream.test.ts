import { POST } from "@/app/api/ai/stream/route";
import { createClient } from "@/lib/supabase/server";
import { streamGeneration } from "@/services/ai-job";
import { AIContextService } from "@/services/ai-context";
import { NextRequest } from "next/server";

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

jest.mock("@/services/ai-job", () => ({
  streamGeneration: jest.fn(),
}));

jest.mock("@/services/ai-context", () => ({
  AIContextService: {
    getContext: jest.fn(),
  },
}));

describe("AI Stream API Route Handler", () => {
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
      signal: {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
    } as unknown as NextRequest;
  }

  async function* mockStream() {
    yield { text: "Hello " };
    yield { text: "world" };
  }

  it("should return 401 if unauthorized", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Unauthorized user session" },
    });

    const req = makeMockRequest({});
    const res = await POST(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it("should return 400 if required fields are missing", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const req = makeMockRequest({
      jobType: "prd",
      // missing context
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it("should stream text successfully when valid inputs are given", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const mockContext = { currentDocument: { id: "doc-1" } };
    (AIContextService.getContext as jest.Mock).mockResolvedValue(mockContext);
    (streamGeneration as jest.Mock).mockResolvedValue(mockStream());

    const req = makeMockRequest({
      jobType: "prd",
      context: {
        projectId: "proj-1",
        documentId: "doc-1",
      },
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/x-ndjson");

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let resultText = "";
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        resultText += decoder.decode(value);
      }
    }

    expect(resultText).toContain('{"text":"Hello "}\n');
    expect(resultText).toContain('{"text":"world"}\n');
  });

  it("should return 400 if AIContext assembly fails", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    (AIContextService.getContext as jest.Mock).mockResolvedValue(null);

    const req = makeMockRequest({
      jobType: "prd",
      context: {
        projectId: "proj-1",
        documentId: "doc-1",
      },
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("AI Context");
  });
});
