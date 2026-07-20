import { ImpactAnalysisService } from "../impact-analysis";
import { DocumentGraph } from "../document-graph";
import { Document, DocumentType, DocumentStatus, DocumentFreshness } from "../../types/document";

// Helper to create a mock document with controllable timestamps
const createDoc = (
  id: string,
  parentId: string | null = null,
  overrides: Partial<Document> = {}
): Document => ({
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
  createdByAi: parentId !== null, // AI-generated if it has a parent
  parentDocumentId: parentId,
  lastGeneratedAt: parentId !== null ? "2026-07-20T10:00:00Z" : null,
  createdAt: "2026-07-19T10:00:00Z",
  updatedAt: "2026-07-19T10:00:00Z",
  ...overrides,
});

describe("ImpactAnalysisService", () => {
  describe("getDocumentFreshness", () => {
    it("should return UP_TO_DATE for a root document without a parent", () => {
      const docs = [createDoc("prd", null, { createdByAi: false })];
      const graph = new DocumentGraph(docs);
      expect(
        ImpactAnalysisService.getDocumentFreshness("prd", graph)
      ).toBe(DocumentFreshness.UP_TO_DATE);
    });

    it("should return UP_TO_DATE when parent has not changed since generation", () => {
      const docs = [
        createDoc("prd", null, {
          createdByAi: false,
          updatedAt: "2026-07-19T08:00:00Z", // parent updated BEFORE child was generated
        }),
        createDoc("stories", "prd", {
          createdByAi: true,
          lastGeneratedAt: "2026-07-20T10:00:00Z",
          updatedAt: "2026-07-20T10:00:00Z",
        }),
      ];
      const graph = new DocumentGraph(docs);
      expect(
        ImpactAnalysisService.getDocumentFreshness("stories", graph)
      ).toBe(DocumentFreshness.UP_TO_DATE);
    });

    it("should return OUTDATED when parent has changed since generation", () => {
      const docs = [
        createDoc("prd", null, {
          createdByAi: false,
          updatedAt: "2026-07-21T12:00:00Z", // parent updated AFTER child was generated
        }),
        createDoc("stories", "prd", {
          createdByAi: true,
          lastGeneratedAt: "2026-07-20T10:00:00Z",
          updatedAt: "2026-07-20T10:00:00Z",
        }),
      ];
      const graph = new DocumentGraph(docs);
      expect(
        ImpactAnalysisService.getDocumentFreshness("stories", graph)
      ).toBe(DocumentFreshness.OUTDATED);
    });

    it("should return OUTDATED when a grandparent has changed since generation", () => {
      const docs = [
        createDoc("prd", null, {
          createdByAi: false,
          updatedAt: "2026-07-21T12:00:00Z", // grandparent updated AFTER
        }),
        createDoc("stories", "prd", {
          createdByAi: true,
          lastGeneratedAt: "2026-07-20T10:00:00Z",
          updatedAt: "2026-07-20T10:00:00Z",
        }),
        createDoc("api-spec", "stories", {
          createdByAi: true,
          lastGeneratedAt: "2026-07-20T10:00:00Z",
          updatedAt: "2026-07-20T10:00:00Z",
        }),
      ];
      const graph = new DocumentGraph(docs);
      expect(
        ImpactAnalysisService.getDocumentFreshness("api-spec", graph)
      ).toBe(DocumentFreshness.OUTDATED);
    });

    it("should return UNKNOWN for a document that has never been generated", () => {
      const docs = [
        createDoc("prd", null, { createdByAi: false }),
        createDoc("stories", "prd", {
          createdByAi: true,
          lastGeneratedAt: null, // never generated
        }),
      ];
      const graph = new DocumentGraph(docs);
      expect(
        ImpactAnalysisService.getDocumentFreshness("stories", graph)
      ).toBe(DocumentFreshness.UNKNOWN);
    });

    it("should return UNKNOWN for a non-existent document", () => {
      const docs = [createDoc("prd", null)];
      const graph = new DocumentGraph(docs);
      expect(
        ImpactAnalysisService.getDocumentFreshness("non-existent", graph)
      ).toBe(DocumentFreshness.UNKNOWN);
    });
  });

  describe("computeFreshnessMap", () => {
    it("should return a map with freshness for all documents", () => {
      const docs = [
        createDoc("prd", null, { createdByAi: false }),
        createDoc("stories", "prd", {
          createdByAi: true,
          lastGeneratedAt: "2026-07-20T10:00:00Z",
        }),
      ];
      const graph = new DocumentGraph(docs);
      const map = ImpactAnalysisService.computeFreshnessMap(docs, graph);

      expect(map.size).toBe(2);
      expect(map.get("prd")).toBe(DocumentFreshness.UP_TO_DATE);
      expect(map.get("stories")).toBe(DocumentFreshness.UP_TO_DATE);
    });
  });

  describe("analyzeImpact", () => {
    it("should return all descendants of a document", () => {
      const docs = [
        createDoc("prd", null, { createdByAi: false }),
        createDoc("stories", "prd", { createdByAi: true }),
        createDoc("api-spec", "stories", { createdByAi: true }),
        createDoc("db-schema", "api-spec", { createdByAi: true }),
      ];
      const graph = new DocumentGraph(docs);
      const result = ImpactAnalysisService.analyzeImpact("prd", graph);

      expect(result).not.toBeNull();
      expect(result!.sourceDocument.id).toBe("prd");
      expect(result!.affectedDocuments.map((a) => a.document.id)).toEqual(
        expect.arrayContaining(["stories", "api-spec", "db-schema"])
      );
      expect(result!.affectedDocuments).toHaveLength(3);
    });

    it("should return null for a non-existent document", () => {
      const docs = [createDoc("prd", null)];
      const graph = new DocumentGraph(docs);
      expect(ImpactAnalysisService.analyzeImpact("non-existent", graph)).toBeNull();
    });

    it("should return empty affected list for a leaf document", () => {
      const docs = [
        createDoc("prd", null, { createdByAi: false }),
        createDoc("stories", "prd", { createdByAi: true }),
      ];
      const graph = new DocumentGraph(docs);
      const result = ImpactAnalysisService.analyzeImpact("stories", graph);

      expect(result).not.toBeNull();
      expect(result!.affectedDocuments).toHaveLength(0);
    });

    it("should include freshness in affected documents", () => {
      const docs = [
        createDoc("prd", null, {
          createdByAi: false,
          updatedAt: "2026-07-21T12:00:00Z",
        }),
        createDoc("stories", "prd", {
          createdByAi: true,
          lastGeneratedAt: "2026-07-20T10:00:00Z",
          updatedAt: "2026-07-20T10:00:00Z",
        }),
        createDoc("api-spec", "stories", {
          createdByAi: true,
          lastGeneratedAt: "2026-07-20T10:00:00Z",
          updatedAt: "2026-07-20T10:00:00Z",
        }),
      ];
      const graph = new DocumentGraph(docs);
      const result = ImpactAnalysisService.analyzeImpact("prd", graph);

      expect(result!.affectedDocuments[0].freshness).toBe(DocumentFreshness.OUTDATED);
      expect(result!.affectedDocuments[1].freshness).toBe(DocumentFreshness.OUTDATED);
    });

    it("should not include the source document itself in affected documents", () => {
      const docs = [
        createDoc("prd", null, { createdByAi: false }),
        createDoc("stories", "prd", { createdByAi: true }),
      ];
      const graph = new DocumentGraph(docs);
      const result = ImpactAnalysisService.analyzeImpact("prd", graph);

      expect(result!.affectedDocuments.map((a) => a.document.id)).not.toContain("prd");
    });
  });
});
