import { DocumentId, RegenerationStatus, DocumentType, incrementVersion } from "../types/document";
import { DocumentGenerationService } from "./document-generation";
import { AIOrchestrator, AIOrchestratorOptions, GenerationResult } from "./ai-orchestrator";
import { DocumentEditorRef } from "@/components/editor/editor";
import { StreamingState } from "@/types/editor";
import { AIJobType } from "@/types/ai";

/**
 * Maps a DocumentType to its corresponding AIJobType for regeneration.
 */
function documentTypeToJobType(type: string): AIJobType | null {
  switch (type) {
    case DocumentType.USER_STORIES:
    case "USER_STORIES":
      return "userStories";
    case DocumentType.API_SPEC:
    case "API_SPEC":
      return "apiSpec";
    case DocumentType.DATABASE_SCHEMA:
    case "DATABASE_SCHEMA":
      return "databaseSchema";
    case DocumentType.PRD:
    case "PRD":
      return "prd";
    default:
      return null;
  }
}

export interface RegenerationQueueItem {
  documentId: DocumentId;
  documentTitle: string;
  documentType: string;
  status: RegenerationStatus;
  error?: string;
}

export interface RegenerationProgress {
  queue: RegenerationQueueItem[];
  currentIndex: number;
  isRunning: boolean;
}

export type RegenerationProgressCallback = (progress: RegenerationProgress) => void;
export type RegenerationNavigateCallback = (documentId: DocumentId) => void;
export type RegenerationCompleteCallback = () => void;

/**
 * RegenerationManager owns the regeneration queue and executes
 * regeneration sequentially. It coordinates navigation, reports progress,
 * and handles cancellation and failures.
 *
 * Architecture:
 *   ImpactAnalysisService
 *          ↓
 *   RegenerationManager  ← you are here
 *          ↓
 *     AIOrchestrator
 *          ↓
 *   DocumentGenerationService
 *          ↓
 *       Repository
 *          ↓
 *     Graph Refresh
 *          ↓
 *        UI
 *
 * Workflow state lives entirely inside this service.
 * No URL query parameters are used.
 */
export class RegenerationManager {
  private queue: RegenerationQueueItem[] = [];
  private currentIndex: number = -1;
  private isRunning: boolean = false;
  private isCancelled: boolean = false;

  private onProgress: RegenerationProgressCallback;
  private onNavigate: RegenerationNavigateCallback;
  private onComplete: RegenerationCompleteCallback;

  private projectId: string;
  private orchestrator: AIOrchestrator | null = null;

  constructor(options: {
    projectId: string;
    onProgress: RegenerationProgressCallback;
    onNavigate: RegenerationNavigateCallback;
    onComplete: RegenerationCompleteCallback;
  }) {
    this.projectId = options.projectId;
    this.onProgress = options.onProgress;
    this.onNavigate = options.onNavigate;
    this.onComplete = options.onComplete;
  }

  /**
   * Enqueue a set of documents for sequential regeneration.
   * Each document will be regenerated in order.
   */
  public enqueue(
    documents: Array<{ id: DocumentId; title: string; type: string }>
  ): void {
    if (this.isRunning) return;

    this.queue = documents.map((doc) => ({
      documentId: doc.id,
      documentTitle: doc.title,
      documentType: doc.type,
      status: RegenerationStatus.QUEUED,
    }));

    this.currentIndex = -1;
    this.isCancelled = false;
    this.emitProgress();
  }

  /**
   * Begin processing the queue. Navigates to each document in turn,
   * runs AI generation via the orchestrator, and commits the result
   * transactionally through DocumentGenerationService.
   */
  public async start(
    editorRef: React.RefObject<DocumentEditorRef | null>,
    onStateChange: (state: StreamingState) => void,
    onTextUpdate: (text: string) => void
  ): Promise<void> {
    if (this.isRunning || this.queue.length === 0) return;

    this.isRunning = true;
    this.isCancelled = false;

    for (let i = 0; i < this.queue.length; i++) {
      if (this.isCancelled) {
        // Mark remaining as cancelled
        for (let j = i; j < this.queue.length; j++) {
          this.queue[j].status = RegenerationStatus.CANCELLED;
        }
        this.emitProgress();
        break;
      }

      this.currentIndex = i;
      const item = this.queue[i];
      item.status = RegenerationStatus.GENERATING;
      this.emitProgress();

      // Navigate to the target document
      this.onNavigate(item.documentId);

      // Small delay to allow navigation and editor mount
      await this.delay(500);

      const jobType = documentTypeToJobType(item.documentType);
      if (!jobType) {
        item.status = RegenerationStatus.FAILED;
        item.error = `Unknown document type: ${item.documentType}`;
        this.emitProgress();
        continue;
      }

      // Create a fresh orchestrator for this document
      this.orchestrator = new AIOrchestrator({
        projectId: this.projectId,
        documentId: item.documentId,
        editorRef,
        onStateChange,
        onTextUpdate,
      });

      try {
        const result = await this.orchestrator.startGeneration(jobType);

        if (this.isCancelled) {
          item.status = RegenerationStatus.CANCELLED;
          this.emitProgress();
          break;
        }

        if (result?.success && result.content) {
          // Transactional commit: only after successful generation
          await DocumentGenerationService.regenerateDocument(
            item.documentId,
            result.content
          );
          item.status = RegenerationStatus.COMPLETED;
        } else {
          item.status = RegenerationStatus.FAILED;
          item.error = result?.error || "Generation returned no content";
        }
      } catch (error) {
        item.status = RegenerationStatus.FAILED;
        item.error = error instanceof Error ? error.message : "Unknown error";
      }

      this.orchestrator = null;
      this.emitProgress();
    }

    this.isRunning = false;
    this.emitProgress();
    this.onComplete();
  }

  /**
   * Cancel the current regeneration process.
   * The current in-flight generation is aborted, and remaining items
   * are marked CANCELLED. The already-completed documents remain committed.
   */
  public cancel(): void {
    this.isCancelled = true;
    if (this.orchestrator) {
      this.orchestrator.cancel();
    }
  }

  /**
   * Reset the manager state. Used after completion or cancellation.
   */
  public reset(): void {
    this.queue = [];
    this.currentIndex = -1;
    this.isRunning = false;
    this.isCancelled = false;
    this.orchestrator = null;
    this.emitProgress();
  }

  public getProgress(): RegenerationProgress {
    return {
      queue: [...this.queue],
      currentIndex: this.currentIndex,
      isRunning: this.isRunning,
    };
  }

  private emitProgress(): void {
    this.onProgress(this.getProgress());
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
