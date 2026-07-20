import { DocumentId, DocumentType, DocumentFreshness } from "../types/document";
import { RetrievalStrategy } from "./retrieval-strategy";

export interface ProjectIndexItem {
  id: DocumentId;
  title: string;
  type: DocumentType | string;
  version: number;
  freshness: DocumentFreshness;
  parentDocumentId: DocumentId | null;
  childrenIds: DocumentId[];
}

export interface ProjectIndex {
  projectId: string;
  projectTitle: string;
  projectDescription?: string;
  documents: ProjectIndexItem[];
  metadata?: Record<string, unknown>;
}

export type ContextSelector = RetrievalStrategy;

/**
 * KeywordContextSelector analyzes the user question against the project document index
 * to select relevant document IDs based on keyword matching, document types, and dependency links.
 *
 * It returns ONLY document IDs (no document content), leaving context assembly to AIContextService.
 */
export class KeywordContextSelector implements RetrievalStrategy {
  public async selectRelevantDocuments(
    index: ProjectIndex,
    question: string
  ): Promise<DocumentId[]> {
    if (!question || !index.documents || index.documents.length === 0) {
      return [];
    }

    const qLower = question.toLowerCase();
    const selectedIds = new Set<DocumentId>();

    // 1. Broad questions (summary, all, project, missing,0 inconsistent, overview) -> include top-level root documents (e.g. PRDs)
    const isBroadQuestion =
      qLower.includes("summarize") ||
      qLower.includes("summary") ||
      qLower.includes("overview") ||
      qLower.includes("project") ||
      qLower.includes("missing") ||
      qLower.includes("inconsistent") ||
      qLower.includes("outdated") ||
      qLower.includes("changed");

    if (isBroadQuestion) {
      // Add all root documents and their immediate children
      for (const item of index.documents) {
        if (!item.parentDocumentId) {
          selectedIds.add(item.id);
          item.childrenIds.forEach((childId) => selectedIds.add(childId));
        }
      }
    }

    // 2. Keyword matching on title, type, and specific domain terms
    for (const item of index.documents) {
      const titleLower = item.title.toLowerCase();
      const typeLower = item.type.toLowerCase();

      // Direct title or type match
      if (qLower.includes(titleLower) || qLower.includes(typeLower)) {
        selectedIds.add(item.id);
      }

      // Domain-specific keyword matching
      if (
        (qLower.includes("api") || qLower.includes("endpoint") || qLower.includes("jwt") || qLower.includes("rest")) &&
        (typeLower.includes("api") || titleLower.includes("api"))
      ) {
        selectedIds.add(item.id);
      }

      if (
        (qLower.includes("user story") || qLower.includes("stories") || qLower.includes("feature") || qLower.includes("requirement")) &&
        (typeLower.includes("user_stories") || typeLower.includes("stories") || titleLower.includes("stories"))
      ) {
        selectedIds.add(item.id);
      }

      if (
        (qLower.includes("database") || qLower.includes("table") || qLower.includes("schema") || qLower.includes("postgres") || qLower.includes("order") || qLower.includes("payment")) &&
        (typeLower.includes("database") || typeLower.includes("schema") || titleLower.includes("schema") || titleLower.includes("db"))
      ) {
        selectedIds.add(item.id);
      }

      if (
        (qLower.includes("prd") || qLower.includes("spec") || qLower.includes("requirements")) &&
        (typeLower.includes("prd") || titleLower.includes("prd"))
      ) {
        selectedIds.add(item.id);
      }

      if (qLower.includes("outdated") && item.freshness === DocumentFreshness.OUTDATED) {
        selectedIds.add(item.id);
      }
    }

    // 3. Fallback: If no document matched, select all documents
    if (selectedIds.size === 0) {
      index.documents.forEach((doc) => selectedIds.add(doc.id));
    }

    return Array.from(selectedIds);
  }
}
