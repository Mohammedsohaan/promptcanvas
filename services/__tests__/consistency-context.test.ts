import { ConsistencyContextService } from "../consistency-context";
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

describe("ConsistencyContextService", () => {
  it("should compute accurate statistics, orphan documents, and traceability gaps", () => {
    const docs = [
      mockDoc("prd-1", "Product Requirement", DocumentType.PRD, null, 2),
      mockDoc("stories-1", "User Stories", DocumentType.USER_STORIES, "prd-1", 1),
      // User Stories has no downstream API Spec -> Traceability gap!
      mockDoc("orphan-api", "Orphan API Spec", DocumentType.API_SPEC, "non-existent-parent", 1),
    ];

    const graph = new DocumentGraph(docs);

    const index: ProjectIndex = {
      projectId: "proj-1",
      projectTitle: "Test Project",
      documents: [
        {
          id: "prd-1",
          title: "Product Requirement",
          type: DocumentType.PRD,
          version: 2,
          freshness: DocumentFreshness.UP_TO_DATE,
          parentDocumentId: null,
          childrenIds: ["stories-1"],
        },
        {
          id: "stories-1",
          title: "User Stories",
          type: DocumentType.USER_STORIES,
          version: 1,
          freshness: DocumentFreshness.OUTDATED,
          parentDocumentId: "prd-1",
          childrenIds: [],
        },
        {
          id: "orphan-api",
          title: "Orphan API Spec",
          type: DocumentType.API_SPEC,
          version: 1,
          freshness: DocumentFreshness.UP_TO_DATE,
          parentDocumentId: "non-existent-parent",
          childrenIds: [],
        },
      ],
    };

    const ctx = ConsistencyContextService.compute(index, graph);

    expect(ctx.totalDocuments).toBe(3);
    expect(ctx.freshnessCounts.upToDate).toBe(2);
    expect(ctx.freshnessCounts.outdated).toBe(1);

    expect(ctx.outdatedDocuments).toHaveLength(1);
    expect(ctx.outdatedDocuments[0].id).toBe("stories-1");

    expect(ctx.orphanDocuments).toHaveLength(1);
    expect(ctx.orphanDocuments[0].id).toBe("orphan-api");

    expect(ctx.traceabilityGaps.length).toBeGreaterThan(0);
    const apiGap = ctx.traceabilityGaps.find((g) => g.sourceDocumentId === "stories-1");
    expect(apiGap).toBeDefined();
    expect(apiGap?.missingChildType).toBe(DocumentType.API_SPEC);

    expect(ctx.versionMismatchCount).toBe(1); // PRD v2 > User Stories v1
  });
});
