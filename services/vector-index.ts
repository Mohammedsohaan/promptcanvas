import { DocumentId, ProjectId } from "../types/document";
import { EmbeddingService } from "./embedding-service";

export interface VectorEntry {
  docId: DocumentId;
  title: string;
  vector: number[];
  textLength: number;
  updatedAt: number;
}

export interface SearchResult {
  docId: DocumentId;
  score: number;
}

/**
 * VectorIndex manages document embeddings per project.
 * Supports upserting, deleting, batch indexing, and similarity search.
 */
export class VectorIndex {
  private static store = new Map<ProjectId, Map<DocumentId, VectorEntry>>();

  /**
   * Upserts a document into the project vector index.
   */
  public static async upsertDocument(
    projectId: ProjectId,
    docId: DocumentId,
    title: string,
    content: string
  ): Promise<void> {
    if (!this.store.has(projectId)) {
      this.store.set(projectId, new Map());
    }

    const textToEmbed = `${title} ${content}`;
    const vector = await EmbeddingService.generateEmbedding(textToEmbed);

    const projectStore = this.store.get(projectId)!;
    projectStore.set(docId, {
      docId,
      title,
      vector,
      textLength: textToEmbed.length,
      updatedAt: Date.now(),
    });
  }

  /**
   * Deletes a document from the vector index.
   */
  public static deleteDocument(projectId: ProjectId, docId: DocumentId): void {
    const projectStore = this.store.get(projectId);
    if (projectStore) {
      projectStore.delete(docId);
    }
  }

  /**
   * Searches the vector index for topK documents similar to the query.
   */
  public static async search(
    projectId: ProjectId,
    query: string,
    topK: number = 5
  ): Promise<SearchResult[]> {
    const projectStore = this.store.get(projectId);
    if (!projectStore || projectStore.size === 0) {
      return [];
    }

    const queryVector = await EmbeddingService.generateEmbedding(query);
    const results: SearchResult[] = [];

    for (const [docId, entry] of projectStore.entries()) {
      const score = EmbeddingService.cosineSimilarity(queryVector, entry.vector);
      results.push({ docId, score });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  /**
   * Batch indexes multiple documents.
   */
  public static async batchIndex(
    projectId: ProjectId,
    documents: Array<{ id: DocumentId; title: string; content?: any }>
  ): Promise<void> {
    for (const doc of documents) {
      let contentStr = "";
      if (typeof doc.content === "string") {
        contentStr = doc.content;
      } else if (doc.content && typeof doc.content === "object") {
        contentStr = doc.content.text || JSON.stringify(doc.content);
      }
      await this.upsertDocument(projectId, doc.id, doc.title, contentStr);
    }
  }

  /**
   * Clears the index for a project.
   */
  public static clear(projectId: ProjectId): void {
    this.store.delete(projectId);
  }
}
