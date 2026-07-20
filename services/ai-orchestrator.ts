import { StreamingState } from "@/types/editor";
import { DocumentEditorRef } from "@/components/editor/editor";
import { AIJobType } from "@/types/ai";
import { StreamConsumer, TipTapStreamConsumer } from "./stream-consumer";
import { toast } from "sonner";

export interface GenerationResult {
  success: boolean;
  jobType: AIJobType;
  content: string;
  error?: string;
}

export interface AIOrchestratorOptions {
  projectId: string;
  documentId?: string;
  onStateChange?: (state: StreamingState) => void;
  onTextUpdate?: (text: string) => void;
  editorRef?: React.RefObject<DocumentEditorRef | null>;
  consumer?: StreamConsumer;
}

/**
 * AIOrchestrator is a stateless streaming engine that orchestrates stream delivery
 * through a StreamConsumer implementation (e.g. TipTapStreamConsumer or CopilotStreamConsumer).
 */
export class AIOrchestrator {
  private abortController: AbortController | null = null;
  private options: AIOrchestratorOptions;
  private consumer: StreamConsumer;
  private streamBuffer: string = "";
  private currentState: StreamingState = "idle";

  constructor(options: AIOrchestratorOptions) {
    this.options = options;

    if (options.consumer) {
      this.consumer = options.consumer;
    } else if (options.editorRef && options.onTextUpdate) {
      this.consumer = new TipTapStreamConsumer(
        options.editorRef,
        options.onTextUpdate
      );
    } else {
      // Fallback consumer that just accumulates text buffer and calls onTextUpdate if supplied
      this.consumer = {
        onChunk: (text: string) => {
          if (options.onTextUpdate) {
            this.streamBuffer += text;
            options.onTextUpdate(this.streamBuffer);
          }
        },
        onComplete: () => {},
        onError: () => {},
      };
    }
  }

  private setState(state: StreamingState) {
    this.currentState = state;
    if (this.options.onStateChange) {
      this.options.onStateChange(state);
    }
  }

  public async startGeneration(
    jobType: AIJobType,
    payload?: Record<string, unknown>
  ): Promise<GenerationResult | void> {
    if (this.currentState === "streaming" || this.currentState === "starting") {
      return;
    }

    this.abortController = new AbortController();
    this.streamBuffer = "";
    if (this.options.onTextUpdate) {
      this.options.onTextUpdate("");
    }
    this.setState("starting");

    const { editorRef, projectId, documentId } = this.options;

    // Lock the editor if present
    if (editorRef?.current) {
      editorRef.current.setEditable(false);
    }

    this.setState("streaming");

    try {
      const response = await fetch("/api/ai/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobType,
          context: {
            projectId,
            documentId,
            ...payload,
          },
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body returned from stream.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const chunkString = decoder.decode(value, { stream: !done });
          const lines = chunkString.split("\n").filter((line) => line.trim() !== "");

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.text) {
                this.streamBuffer += data.text;
                this.consumer.onChunk(data.text);
              }
            } catch {
              console.error("Failed to parse chunk:", line);
            }
          }
        }
      }

      await this.finalizeStream("completed");
      this.consumer.onComplete();

      return {
        success: true,
        jobType,
        content: this.streamBuffer,
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      if (err.name === "AbortError") {
        await this.finalizeStream("cancelled");
        this.consumer.onComplete();
        toast("Generation cancelled.");
        return {
          success: false,
          jobType,
          content: this.streamBuffer,
          error: "Cancelled",
        };
      } else {
        console.error("Streaming error:", err);
        await this.finalizeStream("error");
        this.consumer.onError(err);
        toast.error("Failed to generate content.");
        return {
          success: false,
          jobType,
          content: this.streamBuffer,
          error: err.message,
        };
      }
    }
  }

  public cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  private async finalizeStream(
    finalState: "completed" | "cancelled" | "error" = "completed"
  ): Promise<void> {
    this.setState(finalState);

    const { editorRef } = this.options;

    // Unlock the editor if present
    if (editorRef?.current) {
      editorRef.current.setEditable(true);
    }
  }
}
