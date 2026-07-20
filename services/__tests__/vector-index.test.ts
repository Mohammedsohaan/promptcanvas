import { VectorIndex } from "../vector-index";

describe("VectorIndex", () => {
  beforeEach(() => {
    VectorIndex.clear("proj-test");
  });

  it("should index documents and perform similarity search", async () => {
    await VectorIndex.upsertDocument("proj-test", "doc-1", "Authentication Spec", "User login and JWT token auth");
    await VectorIndex.upsertDocument("proj-test", "doc-2", "Order DB Schema", "SQL tables for orders and items");

    const results = await VectorIndex.search("proj-test", "login authentication", 2);

    expect(results).toHaveLength(2);
    expect(results[0].docId).toBe("doc-1");
  });

  it("should handle batch indexing and document deletion", async () => {
    const docs = [
      { id: "doc-1", title: "API Spec", content: "REST endpoints for users" },
      { id: "doc-2", title: "DB Schema", content: "PostgreSQL tables" },
    ];

    await VectorIndex.batchIndex("proj-test", docs);

    let results = await VectorIndex.search("proj-test", "REST endpoints", 2);
    expect(results[0].docId).toBe("doc-1");

    VectorIndex.deleteDocument("proj-test", "doc-1");
    results = await VectorIndex.search("proj-test", "REST endpoints", 2);
    expect(results).toHaveLength(1);
    expect(results[0].docId).toBe("doc-2");
  });
});
