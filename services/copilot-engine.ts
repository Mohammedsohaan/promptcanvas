import { ProjectId } from "../types/document";
import { CopilotMode, StreamingChunk } from "../types/ai";
import { AIContextService } from "./ai-context";
import { ContextSelector, KeywordContextSelector } from "./context-selector";
import { RetrievalMode, RetrievalStrategy } from "./retrieval-strategy";
import { SemanticContextSelector } from "./semantic-context";
import { HybridContextSelector } from "./hybrid-context";
import { ConsistencyContextService, ConsistencyContext } from "./consistency-context";
import { TraceabilityContextService, TraceabilityContext } from "./traceability-context";
import { ArchitectureContextService, ArchitectureContext } from "./architecture-context";
import { ReleaseContextService, ReleaseContext } from "./release-context";
import { RepositoryIndexService } from "./repository/repository-index";
import { RepositoryAnalysisService, RepositoryAnalysisContext } from "./repository/repository-analysis";
import { buildProjectCopilotPrompt, ProjectPromptInput } from "@/lib/prompts/copilot";
import { streamContent } from "./ai";

export interface CopilotStreamRequest {
  projectId: ProjectId;
  question: string;
  mode?: CopilotMode;
  retrievalMode?: RetrievalMode;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  signal?: AbortSignal;
}

export interface ICopilotEngine {
  streamConversation(
    request: CopilotStreamRequest
  ): AsyncGenerator<StreamingChunk, void, unknown>;
}

/**
 * CopilotEngine owns the complete execution flow for Copilot requests.
 */
export class CopilotEngine implements ICopilotEngine {
  private defaultSelector: ContextSelector;

  constructor(contextSelector?: ContextSelector) {
    this.defaultSelector = contextSelector || new HybridContextSelector();
  }

  private getStrategy(retrievalMode?: RetrievalMode): RetrievalStrategy {
    switch (retrievalMode) {
      case "keyword":
        return new KeywordContextSelector();
      case "semantic":
        return new SemanticContextSelector();
      case "hybrid":
      default:
        return this.defaultSelector || new HybridContextSelector();
    }
  }

  public async *streamConversation(
    request: CopilotStreamRequest
  ): AsyncGenerator<StreamingChunk, void, unknown> {
    const {
      projectId,
      question,
      mode = CopilotMode.GENERAL,
      retrievalMode = "hybrid",
      history = [],
      signal,
    } = request;

    // 1. Get lightweight Project Index via AIContextService
    const projectIndex = await AIContextService.getProjectIndex(projectId);

    // 2. Select relevant document IDs via chosen RetrievalStrategy
    const strategy = this.getStrategy(retrievalMode);
    const relevantDocIds = await strategy.selectRelevantDocuments(
      projectIndex,
      question
    );

    // 3. Load full context for relevant documents via AIContextService
    const projectContext = await AIContextService.getProjectContext(
      projectId,
      relevantDocIds
    );

    // 4. Compute deterministic facts depending on mode
    let consistencyContext: ConsistencyContext | undefined = undefined;
    let traceabilityContext: TraceabilityContext | undefined = undefined;
    let architectureContext: ArchitectureContext | undefined = undefined;
    let releaseContext: ReleaseContext | undefined = undefined;
    let repositoryAnalysisContext: RepositoryAnalysisContext | undefined = undefined;

    if (mode === CopilotMode.REVIEWER) {
      consistencyContext = ConsistencyContextService.compute(
        projectContext.index,
        projectContext.graph
      );
    } else if (mode === CopilotMode.TRACEABILITY) {
      traceabilityContext = TraceabilityContextService.compute(
        projectContext.index,
        projectContext.graph
      );
    } else if (mode === CopilotMode.ARCHITECT) {
      architectureContext = ArchitectureContextService.compute(
        projectContext.index,
        projectContext.graph
      );
    } else if (mode === CopilotMode.RELEASE) {
      releaseContext = ReleaseContextService.compute(
        projectContext.index,
        projectContext.graph
      );
    } else if (mode === CopilotMode.IMPLEMENTATION) {
      const repoIndex = await RepositoryIndexService.indexActiveBranch(projectId);
      repositoryAnalysisContext = RepositoryAnalysisService.compute(
        projectContext.index,
        repoIndex
      );
    }

    // 5. Build prompt via buildProjectCopilotPrompt
    const promptInput: ProjectPromptInput = {
      mode,
      projectContext,
      consistencyContext,
      traceabilityContext,
      architectureContext,
      releaseContext,
      repositoryAnalysisContext,
      question,
      history,
    };

    const prompt = buildProjectCopilotPrompt(promptInput);

    // 6. Stream content using existing provider abstraction
    const stream = streamContent({
      prompt,
      signal,
    });

    for await (const chunk of stream) {
      yield chunk;
    }
  }
}

export const copilotEngine = new CopilotEngine();
