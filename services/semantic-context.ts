import { DocumentId } from "../types/document";
import { ProjectIndex } from "./context-selector";
import { RetrievalStrategy } from "./retrieval-strategy";
import { VectorIndex } from "./vector-index";

/**
 * SemanticContextSelector retrieves relevant documents using dense vector embeddings
 * and cosine similarity search.
 */
export class SemanticContextSelector implements RetrievalStrategy {
  public async selectRelevantDocuments(
    index: ProjectIndex,
    question: string
  ): Promise<DocumentId[]> {
    if (!index.documents || index.documents.length === 0) {
      return [];
    }

    // Ensure documents are indexed in vector store
    await VectorIndex.batchIndex(index.projectId, index.documents);

    // Search top K (default 3) relevant documents by vector similarity
    const results = await VectorIndex.search(index.projectId, question, 3);
    const topDocIds = results.filter((r) => r.score > 0.05).map((r) => r.docId);

    if (topDocIds.length === 0) {
      // Fallback to top document if no vector match above threshold
      return [index.documents[0].id];
    }

    return topDocIds;
  }
}
