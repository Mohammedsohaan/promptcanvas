import { EmbeddingService } from "../embedding-service";

describe("EmbeddingService", () => {

  it("should generate 64-dimensional normalized vector embeddings", async () => {
    const vector = await EmbeddingService.generateEmbedding("Authentication and User Profile API");

    expect(vector).toHaveLength(64);
    const magnitude = Math.sqrt(vector.reduce((acc, val) => acc + val * val, 0));
    expect(magnitude).toBeCloseTo(1.0, 5);
  });

  it("should calculate cosine similarity correctly", async () => {
    const vecA = await EmbeddingService.generateEmbedding("User Authentication Login API");
    const vecB = await EmbeddingService.generateEmbedding("Authentication Login Endpoint");
    const vecC = await EmbeddingService.generateEmbedding("Database PostgreSQL Schema Table");

    const simAB = EmbeddingService.cosineSimilarity(vecA, vecB);
    const simAC = EmbeddingService.cosineSimilarity(vecA, vecC);

    expect(simAB).toBeGreaterThan(simAC);
  });

  it("should batch generate embeddings", async () => {
    const texts = ["Document 1", "Document 2", "Document 3"];
    const embeddings = await EmbeddingService.batchGenerateEmbeddings(texts);

    expect(embeddings).toHaveLength(3);
    expect(embeddings[0]).toHaveLength(64);
  });
});
