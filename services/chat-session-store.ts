import * as React from "react";
import { DocumentReference, MarkdownReferenceParser } from "@/lib/reference-parser";
import { StreamingState } from "@/types/editor";
import { CopilotMode } from "@/types/ai";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  references?: DocumentReference[];
  timestamp: string;
}

export interface ChatSessionState {
  messages: ChatMessage[];
  streamingBuffer: string;
  streamingState: StreamingState;
  activeReferences: DocumentReference[];
  mode: CopilotMode;
}

/**
 * React hook managing in-memory chat session history state.
 *
 * Responsibilities:
 * - User Messages
 * - Assistant Messages
 * - Streaming Buffer & State
 * - Active Document References (incrementally parsed)
 * - Clear Conversation
 * - Zero database persistence
 */
export function useChatSessionStore(initialMode: CopilotMode = CopilotMode.GENERAL) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [streamingBuffer, setStreamingBuffer] = React.useState<string>("");
  const [streamingState, setStreamingState] = React.useState<StreamingState>("idle");
  const [activeReferences, setActiveReferences] = React.useState<DocumentReference[]>([]);
  const [mode, setMode] = React.useState<CopilotMode>(initialMode);

  const parserRef = React.useRef(new MarkdownReferenceParser());

  const addMessage = React.useCallback((message: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMsg: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    return newMsg;
  }, []);

  const appendStreamingChunk = React.useCallback((chunk: string) => {
    setStreamingBuffer((prev) => {
      const next = prev + chunk;
      parserRef.current.consume(chunk);
      setActiveReferences(parserRef.current.finalize());
      return next;
    });
  }, []);

  const startStreaming = React.useCallback(() => {
    setStreamingBuffer("");
    setStreamingState("streaming");
    setActiveReferences([]);
    parserRef.current.reset();
  }, []);

  const completeStreaming = React.useCallback(() => {
    const finalRefs = parserRef.current.finalize();
    setStreamingState("completed");

    setStreamingBuffer((currentBuffer) => {
      if (currentBuffer.trim()) {
        addMessage({
          role: "assistant",
          content: currentBuffer,
          references: finalRefs,
        });
      }
      return "";
    });
  }, [addMessage]);

  const failStreaming = React.useCallback((errorMsg?: string) => {
    setStreamingState("error");
    setStreamingBuffer((currentBuffer) => {
      if (currentBuffer.trim()) {
        addMessage({
          role: "assistant",
          content: currentBuffer + `\n\n*(Generation stopped: ${errorMsg || "Error occurred"})*`,
        });
      }
      return "";
    });
  }, [addMessage]);

  const clearConversation = React.useCallback(() => {
    setMessages([]);
    setStreamingBuffer("");
    setStreamingState("idle");
    setActiveReferences([]);
    parserRef.current.reset();
  }, []);

  return {
    messages,
    streamingBuffer,
    streamingState,
    activeReferences,
    mode,
    setMode,
    addMessage,
    startStreaming,
    appendStreamingChunk,
    completeStreaming,
    failStreaming,
    clearConversation,
    setStreamingState,
  };
}
