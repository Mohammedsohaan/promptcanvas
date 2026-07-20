export type AIProvider = "openai" | "anthropic" | "google";

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  provider?: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  context?: Record<string, unknown>;
  signal?: AbortSignal;
}

export interface AIResponseUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AIResponse {
  id: string;
  text: string;
  provider: AIProvider;
  model: string;
  usage?: AIResponseUsage;
  metadata?: Record<string, unknown>;
}

export interface StreamingChunk {
  text: string;
  done: boolean;
}

export type AIJobType =
  | "prd"
  | "userStories"
  | "apiSpec"
  | "databaseSchema"
  | "test_cases"
  | "sprint_plan"
  | "copilot";

export enum CopilotMode {
  GENERAL = "GENERAL",
  ARCHITECT = "ARCHITECT",
  REVIEWER = "REVIEWER",
  TRACEABILITY = "TRACEABILITY",
  RELEASE = "RELEASE",
  IMPLEMENTATION = "IMPLEMENTATION",
  DEBUG = "DEBUG",
}

export interface AIJobContext {
  documentId?: string;
  projectId: string;
  userInput?: string;
  question?: string;
  selectedText?: string;
  additionalInstructions?: string;
  mode?: CopilotMode;
  relevantDocumentIds?: string[];
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface StreamGenerationRequest {
  jobType: AIJobType;
  context: AIJobContext;
}
