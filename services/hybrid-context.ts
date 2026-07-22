import { DocumentId, DocumentFreshness } from "../types/document";
import { ProjectIndex, KeywordContextSelector } from "./context-selector";
import { RetrievalStrategy } from "./retrieval-strategy";
import { VectorIndex } from "./vector-index";

/**
 * HybridContextSelector combines Keyword Frequency (BM25 style), Vector Embedding
 * Similarity, Freshness, and Graph Weight into a composite hybrid rank score.
 */
export class HybridContextSelector implements RetrievalStrategy {
  private keywordSelector: KeywordContextSelector;

  constructor() {
    this.keywordSelector = new KeywordContextSelector();
  }

  public async selectRelevantDocuments(
    index: ProjectIndex,
    question: string
  ): Promise<DocumentId[]> {
    if (!index.documents || index.documents.length === 0) {
      return [];
    }

    // 1. Get Keyword Selected Document IDs
    const keywordDocIds = await this.keywordSelector.selectRelevantDocuments(
      index,
      question
    );

    // 2. Batch Index & Vector Search
    await VectorIndex.batchIndex(index.projectId, index.documents);
    const vectorResults = await VectorIndex.search(
      index.projectId,
      question,
      index.documents.length
    );

    const vectorScoreMap = new Map<DocumentId, number>();
    vectorResults.forEach((r) => vectorScoreMap.set(r.docId, r.score));

    // 3. Compute Composite Hybrid Rank Score
    const scoredDocs = index.documents.map((doc) => {
      let score = 0;

      // Keyword match score weight (40%)
      if (keywordDocIds.includes(doc.id)) {
        score += 0.4;
      }

      // Semantic Vector Similarity score weight (40%)
      const simScore = vectorScoreMap.get(doc.id) || 0;
      score += simScore * 0.4;

      // Document Freshness bonus (10%)
      if (doc.freshness === DocumentFreshness.UP_TO_DATE || (doc.freshness as string) === "UP_TO_DATE") {
        score += 0.1;
      }

      // Graph Weight / Connectivity (10%)
      if (doc.childrenIds && doc.childrenIds.length > 0) {
        score += 0.1;
      }

      return { docId: doc.id, score };
    });

    // Sort descending by hybrid score
    scoredDocs.sort((a, b) => b.score - a.score);

    // Return top 3 document IDs
    return scoredDocs.slice(0, 3).map((d) => d.docId);
  }
}
