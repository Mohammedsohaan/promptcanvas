import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateContent } from "@/services/ai";
import { AIProvider } from "@/types/ai";

const VALID_PROVIDERS: AIProvider[] = ["openai", "anthropic", "google"];

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the user via Supabase server client
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const { provider, prompt, projectId, documentId } = body as {
      provider?: string;
      prompt?: string;
      projectId?: string;
      documentId?: string;
    };

    // Validate required fields
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Field 'prompt' is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json(
        { success: false, error: "Field 'projectId' is required." },
        { status: 400 }
      );
    }

    if (!documentId || typeof documentId !== "string") {
      return NextResponse.json(
        { success: false, error: "Field 'documentId' is required." },
        { status: 400 }
      );
    }

    if (!provider || typeof provider !== "string") {
      return NextResponse.json(
        { success: false, error: "Field 'provider' is required." },
        { status: 400 }
      );
    }

    if (!VALID_PROVIDERS.includes(provider as AIProvider)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid provider '${provider}'. Must be one of: ${VALID_PROVIDERS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // 3. Delegate to the AI service layer — the route never touches provider internals
    const result = await generateContent({
      prompt: prompt.trim(),
      provider: provider as AIProvider,
      context: {
        projectId,
        documentId,
        userId: user.id,
      },
    });

    // 4. Return structured response
    return NextResponse.json({
      success: true,
      provider: result.provider,
      content: result.text,
      model: result.model,
      usage: result.usage,
    });
  } catch (error: any) {
    console.error("[AI Generate API] Unexpected error:", error);
    
    if (error instanceof Error && error.message.startsWith("Provider not implemented")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 501 } // Not Implemented
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
