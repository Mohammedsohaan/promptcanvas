import { Document, DocumentId, DocumentType, ProjectId } from "../types/document";
import { buildTestCasesPrompt } from "@/lib/prompts/test-cases";
import { streamContent } from "./ai";

export interface GenerateTestCasesParams {
  projectId: ProjectId;
  parentDocument?: Document;
  projectContextDocs?: Document[];
  additionalInstructions?: string;
  signal?: AbortSignal;
}

/**
 * TestCaseGenerationService generates test case documents using the existing AI streaming pipeline.
 */
export class TestCaseGenerationService {
  public static async *generateStream(
    params: GenerateTestCasesParams
  ): AsyncGenerator<{ text: string; done: boolean }, void, unknown> {
    const { parentDocument, projectContextDocs, additionalInstructions, signal } = params;

    let parentContentStr = "";
    if (parentDocument) {
      parentContentStr =
        typeof parentDocument.content === "string"
          ? parentDocument.content
          : JSON.stringify(parentDocument.content, null, 2);
    }

    const prompt = buildTestCasesPrompt({
      parentDocumentTitle: parentDocument?.title,
      parentDocumentType: parentDocument?.type,
      parentDocumentContent: parentContentStr,
      additionalInstructions,
    });

    const stream = streamContent({
      prompt,
      signal,
    });

    for await (const chunk of stream) {
      yield chunk;
    }
  }
}
