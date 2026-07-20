import { SemanticContextSelector } from "../semantic-context";
import { ProjectIndex } from "../context-selector";
import { DocumentType, DocumentFreshness } from "../../types/document";

describe("SemanticContextSelector", () => {
  it("should select relevant documents based on semantic vector similarity", async () => {
    const selector = new SemanticContextSelector();

    const index: ProjectIndex = {
      projectId: "proj-semantic-test",
      projectTitle: "Test Project",
      documents: [
        {
          id: "doc-auth",
          title: "User Authentication",
          type: DocumentType.PRD,
          version: 1,
          freshness: DocumentFreshness.UP_TO_DATE,
          parentDocumentId: null,
          childrenIds: [],
        },
        {
          id: "doc-billing",
          title: "Stripe Billing System",
          type: DocumentType.API_SPEC,
          version: 1,
          freshness: DocumentFreshness.UP_TO_DATE,
          parentDocumentId: null,
          childrenIds: [],
        },
      ],
    };

    const selectedIds = await selector.selectRelevantDocuments(index, "authentication JWT login");

    expect(selectedIds).toContain("doc-auth");
  });
});
