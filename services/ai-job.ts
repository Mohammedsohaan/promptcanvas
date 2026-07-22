import { generateContent, streamContent } from "./ai";
import { AIProvider, AIResponse, StreamingChunk, StreamGenerationRequest } from "@/types/ai";
import { PromptContext, PromptInput } from "@/lib/prompts/types";
import { buildPrdPrompt } from "@/lib/prompts/prd";
import { buildUserStoriesPrompt } from "@/lib/prompts/user-stories";
import { buildApiSpecPrompt } from "@/lib/prompts/api-spec";
import { buildDatabaseSchemaPrompt } from "@/lib/prompts/database-schema";
import { buildTestCasesPrompt } from "@/lib/prompts/test-cases";
import { buildSprintPlanPrompt } from "@/lib/prompts/sprint-plan";
import { AIContext } from "./ai-context";
import { copilotEngine } from "./copilot-engine";

export interface AIJobRequest {
  provider?: AIProvider;
  model?: string;
  context: PromptContext;
}

export async function generatePRD(request: AIJobRequest): Promise<AIResponse> {
  const prompt = buildPrdPrompt(request.context);
  return generateContent({
    prompt,
    provider: request.provider,
    model: request.model,
  });
}

export async function generateUserStories(request: AIJobRequest): Promise<AIResponse> {
  const prompt = buildUserStoriesPrompt(request.context);
  return generateContent({
    prompt,
    provider: request.provider,
    model: request.model,
  });
}

export async function generateApiSpec(request: AIJobRequest): Promise<AIResponse> {
  const prompt = buildApiSpecPrompt(request.context);
  return generateContent({
    prompt,
    provider: request.provider,
    model: request.model,
  });
}

export async function generateDatabaseSchema(request: AIJobRequest): Promise<AIResponse> {
  const prompt = buildDatabaseSchemaPrompt(request.context);
  return generateContent({
    prompt,
    provider: request.provider,
    model: request.model,
  });
}

export async function* streamGeneration(
  request: StreamGenerationRequest,
  aiContext?: AIContext | null,
  provider?: AIProvider,
  model?: string,
  signal?: AbortSignal
): AsyncGenerator<StreamingChunk, void, unknown> {
  if (request.jobType === "copilot") {
    const stream = copilotEngine.streamConversation({
      projectId: request.context.projectId,
      question: request.context.question || request.context.userInput || "Summarize this project.",
      mode: request.context.mode,
      history: request.context.history,
      signal,
    });

    for await (const chunk of stream) {
      yield chunk;
    }
    return;
  }

  if (!aiContext) {
    throw new Error("AIContext is required for document generation job types.");
  }

  let prompt = "";

  const promptInput: PromptInput = {
    context: aiContext,
    jobType: request.jobType,
  };

  const legacyPromptContext: PromptContext = {
    projectTitle: aiContext.projectSummary || "Untitled Project",
    documentTitle: aiContext.currentDocument.title,
    documentContent: aiContext.currentDocument.content
      ? JSON.stringify(aiContext.currentDocument.content)
      : "",
    additionalInstructions: request.context.additionalInstructions,
  };

  switch (request.jobType) {
    case "prd":
      prompt = buildPrdPrompt(legacyPromptContext);
      break;
    case "userStories":
      prompt = buildUserStoriesPrompt(promptInput);
      break;
    case "apiSpec":
      prompt = buildApiSpecPrompt(promptInput);
      break;
    case "databaseSchema":
      prompt = buildDatabaseSchemaPrompt(promptInput);
      break;
    case "test_cases":
      prompt = buildTestCasesPrompt({
        parentDocumentTitle: aiContext.parent?.title || aiContext.currentDocument.title,
        parentDocumentType: aiContext.parent?.type || aiContext.currentDocument.type,
        parentDocumentContent:
          typeof aiContext.currentDocument.content === "string"
            ? aiContext.currentDocument.content
            : JSON.stringify(aiContext.currentDocument.content, null, 2),
        additionalInstructions: request.context.additionalInstructions,
      });
      break;
    case "sprint_plan":
      prompt = buildSprintPlanPrompt({
        projectTitle: aiContext.projectSummary || "Project",
        additionalInstructions: request.context.additionalInstructions,
      });
      break;
    default:
      throw new Error(`Unknown jobType: ${request.jobType}`);
  }

  const stream = streamContent({
    prompt,
    provider,
    model,
    signal,
  });

  for await (const chunk of stream) {
    yield chunk;
  }
}
