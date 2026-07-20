import { TraceabilityContextService } from "../traceability-context";
import { DocumentGraph } from "../document-graph";
import { ProjectIndex } from "../context-selector";
import { DocumentType, DocumentFreshness, Document } from "../../types/document";

const mockDoc = (
  id: string,
  title: string,
  type: DocumentType,
  parentId: string | null = null,
  version: number = 1
): Document => ({
  id,
  projectId: "proj-1",
  title,
  type,
  status: "READY" as any,
  version,
  content: {},
  icon: "FileText",
  isFavorite: false,
  sortOrder: 0,
  createdByAi: false,
  parentDocumentId: parentId,
  lastGeneratedAt: "2026-07-20T10:00:00Z",
  createdAt: "2026-07-19T10:00:00Z",
  updatedAt: "2026-07-19T10:00:00Z",
});

describe("TraceabilityContextService", () => {
  it("should build complete requirement chains from PRD down to Test Cases", () => {
    const docs = [
      mockDoc("prd-1", "PRD Auth", DocumentType.PRD, null),
      mockDoc("story-1", "User Story Auth", DocumentType.USER_STORIES, "prd-1"),
      mockDoc("api-1", "API Spec Auth", DocumentType.API_SPEC, "story-1"),
      mockDoc("db-1", "DB Schema Auth", DocumentType.DATABASE_SCHEMA, "api-1"),
      mockDoc("test-1", "Test Cases Auth", DocumentType.TEST_CASES, "db-1"),
    ];

    const graph = new DocumentGraph(docs);

    const index: ProjectIndex = {
      projectId: "proj-1",
      projectTitle: "Test Project",
      documents: docs.map((d) => ({
        id: d.id,
        title: d.title,
        type: d.type,
        version: d.version,
        freshness: DocumentFreshness.UP_TO_DATE,
        parentDocumentId: d.parentDocumentId,
        childrenIds: graph.getChildren(d.id).map((c) => c.id),
      })),
    };

    const ctx = TraceabilityContextService.compute(index, graph);

    expect(ctx.chains).toHaveLength(1);
    expect(ctx.chains[0].status).toBe("Complete");
    expect(ctx.chains[0].coveragePercentage).toBe(100);
    expect(ctx.overallCoverage).toBe(100);
    expect(ctx.summary.completeChains).toBe(1);
  });

  it("should identify broken and partial chains and calculate missing downstream artifacts", () => {
    const docs = [
      mockDoc("prd-1", "PRD Auth", DocumentType.PRD, null),
      mockDoc("story-1", "User Story Auth", DocumentType.USER_STORIES, "prd-1"),
      // Missing API Spec, DB Schema, and Test Cases -> Partial Chain at User Story stage!
    ];

    const graph = new DocumentGraph(docs);

    const index: ProjectIndex = {
      projectId: "proj-1",
      projectTitle: "Test Project",
      documents: docs.map((d) => ({
        id: d.id,
        title: d.title,
        type: d.type,
        version: d.version,
        freshness: DocumentFreshness.UP_TO_DATE,
        parentDocumentId: d.parentDocumentId,
        childrenIds: graph.getChildren(d.id).map((c) => c.id),
      })),
    };

    const ctx = TraceabilityContextService.compute(index, graph);

    expect(ctx.chains).toHaveLength(1);
    expect(ctx.chains[0].status).toBe("Partial");
    expect(ctx.chains[0].missingStage).toBe("API Specification");
    expect(ctx.chains[0].coveragePercentage).toBe(40);
    expect(ctx.summary.missingApiSpecs).toBe(1);
  });
});
