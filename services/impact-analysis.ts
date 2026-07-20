import { Document, DocumentId, DocumentFreshness } from "../types/document";
import { DocumentGraph } from "./document-graph";

export interface AffectedDocument {
  document: Document;
  freshness: DocumentFreshness;
}

export interface ImpactAnalysisResult {
  sourceDocument: Document;
  affectedDocuments: AffectedDocument[];
}

/**
 * ImpactAnalysisService is the single source of truth for document freshness.
 * It uses DocumentGraph traversal to determine which descendants are affected
 * when a source document changes.
 */
export class ImpactAnalysisService {
  /**
   * Determines the freshness of a single document.
   *
   * A generated document is OUTDATED when:
   * - Its parent document has been updated after it was last generated, OR
   * - Any ancestor has been updated after it was last generated.
   *
   * A document that was never generated (no lastGeneratedAt) and has no
   * parent is UP_TO_DATE (root document or manual document).
   *
   * A document that was never generated but has a parent is UNKNOWN
   * (it exists but we cannot determine freshness without a generation timestamp).
   */
  public static getDocumentFreshness(
    documentId: DocumentId,
    graph: DocumentGraph
  ): DocumentFreshness {
    const doc = graph.getDocument(documentId);
    if (!doc) return DocumentFreshness.UNKNOWN;

    // Non-AI documents (manual root documents like PRDs) are always up to date
    if (!doc.createdByAi && !doc.parentDocumentId) {
      return DocumentFreshness.UP_TO_DATE;
    }

    // If the document has never been generated, we cannot determine freshness
    if (!doc.lastGeneratedAt) {
      return DocumentFreshness.UNKNOWN;
    }

    const generatedAt = new Date(doc.lastGeneratedAt).getTime();
    const ancestors = graph.getAncestors(documentId);

    for (const ancestor of ancestors) {
      const ancestorUpdatedAt = new Date(ancestor.updatedAt).getTime();
      if (ancestorUpdatedAt > generatedAt) {
        return DocumentFreshness.OUTDATED;
      }
    }

    return DocumentFreshness.UP_TO_DATE;
  }

  /**
   * Computes freshness for every document in a collection, returning a Map.
   * UI components should call this once per render cycle and read from the map.
   */
  public static computeFreshnessMap(
    documents: Document[],
    graph: DocumentGraph
  ): Map<DocumentId, DocumentFreshness> {
    const freshnessMap = new Map<DocumentId, DocumentFreshness>();
    for (const doc of documents) {
      freshnessMap.set(doc.id, this.getDocumentFreshness(doc.id, graph));
    }
    return freshnessMap;
  }

  /**
   * Given a document that has changed, returns all descendant documents
   * that may be affected, along with their freshness status.
   *
   * This uses DocumentGraph.getDescendants — no manual traversal.
   */
  public static analyzeImpact(
    documentId: DocumentId,
    graph: DocumentGraph
  ): ImpactAnalysisResult | null {
    const sourceDocument = graph.getDocument(documentId);
    if (!sourceDocument) return null;

    const descendants = graph.getDescendants(documentId);

    const affectedDocuments: AffectedDocument[] = descendants.map((desc) => ({
      document: desc,
      freshness: this.getDocumentFreshness(desc.id, graph),
    }));

    return {
      sourceDocument,
      affectedDocuments,
    };
  }
}
