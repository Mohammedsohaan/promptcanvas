import { Document, ProjectId } from "../types/document";
import { buildSprintPlanPrompt } from "@/lib/prompts/sprint-plan";
import { streamContent } from "./ai";

export interface GenerateSprintPlanParams {
  projectId: ProjectId;
  projectTitle?: string;
  projectContextDocs?: Document[];
  additionalInstructions?: string;
  signal?: AbortSignal;
}

/**
 * SprintPlanningService transforms project documentation into an executable engineering backlog
 * using the existing AI streaming pipeline.
 */
export class SprintPlanningService {
  public static async *generateStream(
    params: GenerateSprintPlanParams
  ): AsyncGenerator<{ text: string; done: boolean }, void, unknown> {
    const { projectTitle, additionalInstructions, signal } = params;

    const prompt = buildSprintPlanPrompt({
      projectTitle,
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
