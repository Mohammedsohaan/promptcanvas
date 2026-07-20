import { DocumentGraph } from "../document-graph";
import { DocumentGraphValidator } from "../document-graph-validator";
import { Document, DocumentType, DocumentStatus } from "../../types/document";

// Helper to create a mock document
const createDoc = (id: string, parentId: string | null = null): Document => ({
  id,
  projectId: "proj-1",
  title: `Doc ${id}`,
  type: DocumentType.CUSTOM,
  status: DocumentStatus.READY,
  version: 1,
  content: {},
  icon: "File",
  isFavorite: false,
  sortOrder: 0,
  createdByAi: false,
  parentDocumentId: parentId,
  lastGeneratedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

describe("DocumentGraph", () => {
  it("should build a graph and resolve children correctly", () => {
    const docs = [
      createDoc("1"),
      createDoc("2", "1"),
      createDoc("3", "1"),
      createDoc("4", "2")
    ];

    const graph = new DocumentGraph(docs);

    const childrenOf1 = graph.getChildren("1");
    expect(childrenOf1.map(d => d.id)).toEqual(expect.arrayContaining(["2", "3"]));
    
    const childrenOf2 = graph.getChildren("2");
    expect(childrenOf2.map(d => d.id)).toEqual(["4"]);

    const childrenOf4 = graph.getChildren("4");
    expect(childrenOf4).toEqual([]);
  });

  it("should resolve parent correctly", () => {
    const docs = [createDoc("1"), createDoc("2", "1")];
    const graph = new DocumentGraph(docs);
    expect(graph.getParent("2")?.id).toBe("1");
    expect(graph.getParent("1")).toBeUndefined();
  });

  it("should resolve ancestors in order (immediate parent first)", () => {
    const docs = [
      createDoc("1"),
      createDoc("2", "1"),
      createDoc("3", "2")
    ];
    const graph = new DocumentGraph(docs);
    const ancestors = graph.getAncestors("3");
    expect(ancestors.map(d => d.id)).toEqual(["2", "1"]);
  });

  it("should resolve descendants (BFS order)", () => {
    const docs = [
      createDoc("1"),
      createDoc("2", "1"),
      createDoc("3", "1"),
      createDoc("4", "2")
    ];
    const graph = new DocumentGraph(docs);
    const descendants = graph.getDescendants("1");
    expect(descendants.map(d => d.id)).toEqual(expect.arrayContaining(["2", "3", "4"]));
  });

  it("should return full lineage (ancestors + current + descendants)", () => {
    const docs = [
      createDoc("1"),
      createDoc("2", "1"),
      createDoc("3", "2"),
      createDoc("4", "2")
    ];
    const graph = new DocumentGraph(docs);
    const lineage = graph.getLineage("2");
    // ancestors reversed (1), current (2), descendants (3, 4)
    expect(lineage.map(d => d.id)).toEqual(["1", "2", "3", "4"]);
  });

  it("should find siblings", () => {
    const docs = [
      createDoc("1"),
      createDoc("2", "1"),
      createDoc("3", "1")
    ];
    const graph = new DocumentGraph(docs);
    const siblings = graph.getSiblingDocuments("2");
    expect(siblings.map(d => d.id)).toEqual(["3"]);
  });
});

describe("DocumentGraphValidator", () => {
  it("should detect a valid graph", () => {
    const docs = [createDoc("1"), createDoc("2", "1")];
    const result = DocumentGraphValidator.validateGraph(docs);
    expect(result.isValid).toBe(true);
  });

  it("should detect self-reference (invalid reference)", () => {
    const docs = [createDoc("1", "1")]; // self reference
    const result = DocumentGraphValidator.validateGraph(docs);
    expect(result.isValid).toBe(false);
    expect(result.invalidReferences).toContain("1");
  });

  it("should detect orphan documents (missing parent)", () => {
    const docs = [createDoc("1"), createDoc("2", "999")]; // 999 does not exist
    const result = DocumentGraphValidator.validateGraph(docs);
    expect(result.isValid).toBe(false);
    expect(result.orphans).toContain("2");
  });

  it("should detect cycles", () => {
    // 1 -> 2 -> 3 -> 1
    const docs = [
      createDoc("1", "3"),
      createDoc("2", "1"),
      createDoc("3", "2")
    ];
    const result = DocumentGraphValidator.validateGraph(docs);
    expect(result.isValid).toBe(false);
    expect(result.cycles.length).toBeGreaterThan(0);
  });

  it("should handle large disconnected graphs performantly", () => {
    const docs: Document[] = [];
    // Create 1000 disconnected pairs
    for (let i = 0; i < 2000; i += 2) {
      docs.push(createDoc(`${i}`));
      docs.push(createDoc(`${i + 1}`, `${i}`));
    }
    
    const start = performance.now();
    const result = DocumentGraphValidator.validateGraph(docs);
    const end = performance.now();
    
    expect(result.isValid).toBe(true);
    expect(end - start).toBeLessThan(100); // Should be very fast
  });
});
