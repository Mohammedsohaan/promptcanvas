import { HybridContextSelector } from "../hybrid-context";
import { ProjectIndex } from "../context-selector";
import { DocumentType, DocumentFreshness } from "../../types/document";

describe("HybridContextSelector", () => {
  it("should combine keyword and vector similarity into composite rank score", async () => {
    const selector = new HybridContextSelector();

    const index: ProjectIndex = {
      projectId: "proj-hybrid-test",
      projectTitle: "Test Project",
      documents: [
        {
          id: "doc-prd",
          title: "PRD Authentication",
          type: DocumentType.PRD,
          version: 1,
          freshness: DocumentFreshness.UP_TO_DATE,
          parentDocumentId: null,
          childrenIds: ["doc-api"],
        },
        {
          id: "doc-api",
          title: "API Specification Auth",
          type: DocumentType.API_SPEC,
          version: 1,
          freshness: DocumentFreshness.UP_TO_DATE,
          parentDocumentId: "doc-prd",
          childrenIds: [],
        },
      ],
    };

    const selectedIds = await selector.selectRelevantDocuments(index, "authentication JWT login");

    expect(selectedIds.length).toBeGreaterThan(0);
    expect(selectedIds).toContain("doc-prd");
  });
});
