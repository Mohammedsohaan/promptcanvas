import { DocumentId } from "../types/document";
import { ProjectIndex } from "./context-selector";

export type RetrievalMode = "keyword" | "semantic" | "hybrid";

export interface RetrievalStrategy {
  selectRelevantDocuments(
    index: ProjectIndex,
    question: string
  ): Promise<DocumentId[]>;
}
