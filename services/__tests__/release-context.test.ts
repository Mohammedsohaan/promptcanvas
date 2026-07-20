import { ReleaseContextService } from "../release-context";
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

describe("ReleaseContextService", () => {
  it("should aggregate consistency, traceability, and architecture into a Ready release status", () => {
    const docs = [
      mockDoc("prd-1", "PRD Auth System", DocumentType.PRD, null),
      mockDoc("story-1", "User Story Login", DocumentType.USER_STORIES, "prd-1"),
      mockDoc("api-1", "API Spec Auth JWT", DocumentType.API_SPEC, "story-1"),
      mockDoc("db-1", "DB Schema Users", DocumentType.DATABASE_SCHEMA, "api-1"),
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

    const ctx = ReleaseContextService.compute(index, graph);

    expect(ctx.projectScore).toBe(100);
    expect(ctx.status).toBe("Ready");
    expect(ctx.readyComponents).toHaveLength(1);
    expect(ctx.criticalIssues).toHaveLength(0);
    expect(ctx.stats.deploymentReadiness).toBe("Excellent");
  });

  it("should detect critical blockers for broken requirement chains and set status to Not Ready", () => {
    const docs = [
      mockDoc("prd-1", "PRD Payments", DocumentType.PRD, null),
      // Missing User Story, API Spec, DB Schema, Test Cases -> Broken Chain!
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

    const ctx = ReleaseContextService.compute(index, graph);

    expect(ctx.status).toBe("Not Ready");
    expect(ctx.criticalIssues.length).toBeGreaterThan(0);
    expect(ctx.brokenChains).toContain("PRD Payments");
  });
});
