import { ArchitectureContextService } from "../architecture-context";
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

describe("ArchitectureContextService", () => {
  it("should compute layer breakdown, dependency depth, and health ratings", () => {
    const docs = [
      mockDoc("prd-1", "PRD Auth System", DocumentType.PRD, null),
      mockDoc("story-1", "User Story Login", DocumentType.USER_STORIES, "prd-1"),
      mockDoc("api-1", "API Spec Auth JWT", DocumentType.API_SPEC, "story-1"),
      mockDoc("db-1", "DB Schema Users", DocumentType.DATABASE_SCHEMA, "api-1"),
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

    const ctx = ArchitectureContextService.compute(index, graph);

    expect(ctx.serviceCount).toBe(4);
    expect(ctx.dependencyDepth).toBe(4);
    expect(ctx.authCoverage).toBe(true);
    expect(ctx.apiCoverage).toBe(100);
    expect(ctx.databaseCoverage).toBe(100);
    expect(ctx.stats.overallScore).toBe(100);
    expect(ctx.stats.architectureQuality).toBe("Excellent");
    expect(ctx.stats.security).toBe("Excellent");
  });

  it("should detect circular dependencies and single points of failure", () => {
    const docs = [
      mockDoc("doc-1", "Core Gateway", DocumentType.PRD, null),
      mockDoc("doc-2", "Child 1", DocumentType.USER_STORIES, "doc-1"),
      mockDoc("doc-3", "Child 2", DocumentType.API_SPEC, "doc-1"),
      mockDoc("doc-4", "Child 3", DocumentType.DATABASE_SCHEMA, "doc-1"),
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

    const ctx = ArchitectureContextService.compute(index, graph);

    expect(ctx.singlePointsOfFailure.length).toBeGreaterThan(0);
    expect(ctx.singlePointsOfFailure[0].title).toBe("Core Gateway");
  });
});
