import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { streamGeneration } from "@/services/ai-job";
import { StreamGenerationRequest } from "@/types/ai";
import { AIContextService } from "@/services/ai-context";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json() as StreamGenerationRequest;

    if (!body.jobType || !body.context || !body.context.projectId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const abortController = new AbortController();
    
    // In case the client disconnects
    req.signal.addEventListener("abort", () => {
      abortController.abort();
    });

    let aiContext = null;

    // Document generators require document-level context; CopilotEngine handles its own context
    if (body.jobType !== "copilot" && body.context.documentId) {
      aiContext = await AIContextService.getContext(body.context.projectId, body.context.documentId);
      if (!aiContext) {
        return NextResponse.json(
          { success: false, error: "Failed to assemble AI Context" },
          { status: 400 }
        );
      }
    }

    const stream = await streamGeneration(
      body,
      aiContext,
      undefined,
      undefined,
      abortController.signal
    );

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(
              new TextEncoder().encode(JSON.stringify(chunk) + "\n")
            );
          }
          controller.close();
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
             // Normal abort, just close stream
             controller.close();
          } else {
             controller.error(error);
          }
        }
      },
      cancel() {
        abortController.abort();
      }
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in AI stream route:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
