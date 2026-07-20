import { buildProjectCopilotPrompt } from "../../lib/prompts/copilot";
import { CopilotMode } from "../../types/ai";
import { DocumentType, DocumentFreshness } from "../../types/document";

describe("ImplementationReview", () => {
  it("should generate prompt for CopilotMode.IMPLEMENTATION and include repository stats", () => {
    const prompt = buildProjectCopilotPrompt({
      mode: CopilotMode.IMPLEMENTATION,
      projectContext: {
        index: {
          projectId: "proj-repo",
          projectTitle: "E-Commerce",
          documents: [
            {
              id: "doc-1",
              title: "Payment Checkout API",
              type: DocumentType.API_SPEC,
              version: 1,
              freshness: DocumentFreshness.UP_TO_DATE,
              parentDocumentId: null,
              childrenIds: [],
            },
          ],
        },
        relevantDocuments: [],
      },
      repositoryAnalysisContext: {
        implementationCoverage: 100,
        specificationCoverage: 100,
        implementedRequirements: ["Payment Checkout API"],
        missingFeatures: [],
        databaseDrift: [],
        deadCode: [],
        specificationDrift: [],
        architectureViolations: [],
        healthScore: 100,
      },
      question: "Review checkouts",
    });

    expect(prompt).toContain("IMPLEMENTATION REVIEW INSTRUCTIONS");
    expect(prompt).toContain("Implementation Coverage: 100%");
    expect(prompt).toContain("Repository Health: 100 / 100");
  });
});
