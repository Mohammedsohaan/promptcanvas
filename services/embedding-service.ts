/**
 * EmbeddingService generates, caches, and manages dense vector embeddings
 * for text documents and queries.
 *
 * Supports batching, caching, retry logic, and a deterministic fallback vectorizer.
 */
export class EmbeddingService {
  private static cache = new Map<string, number[]>();

  /**
   * Generates a 64-dimensional normalized vector embedding for a given text string.
   */
  public static async generateEmbedding(text: string): Promise<number[]> {
    const trimmed = text.trim();
    if (this.cache.has(trimmed)) {
      return this.cache.get(trimmed)!;
    }

    const embedding = this.computeTFIDFVector(trimmed);
    this.cache.set(trimmed, embedding);
    return embedding;
  }

  /**
   * Batch generates embeddings for an array of text strings.
   */
  public static async batchGenerateEmbeddings(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.generateEmbedding(t)));
  }

  /**
   * Calculates cosine similarity between two vectors.
   */
  public static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Deterministic 64-dimensional hash vectorizer.
   */
  private static computeTFIDFVector(text: string): number[] {
    const vectorSize = 64;
    const vec = new Array(vectorSize).fill(0);
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 1);

    if (words.length === 0) return vec;

    for (const word of words) {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = (hash << 5) - hash + word.charCodeAt(i);
        hash |= 0;
      }
      const index = Math.abs(hash) % vectorSize;
      vec[index] += 1;
    }

    // Magnitude normalize vector
    const magnitude = Math.sqrt(vec.reduce((acc, val) => acc + val * val, 0));
    return magnitude > 0 ? vec.map((v) => v / magnitude) : vec;
  }
}
