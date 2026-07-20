import { DocumentType, DocumentFreshness } from "../../types/document";
import { buildSprintPlanPrompt } from "../../lib/prompts/sprint-plan";
import { DocumentGraph } from "../document-graph";
import { ImpactAnalysisService } from "../impact-analysis";

describe("SprintPlanningService & Work Breakdown Engine", () => {
  it("should build structured sprint plan prompt correctly", () => {
    const prompt = buildSprintPlanPrompt({
      projectTitle: "E-Commerce System",
      additionalInstructions: "Focus Sprint 1 strictly on Authentication and Payments.",
    });

    expect(prompt).toContain("E-Commerce System");
    expect(prompt).toContain("Sprint Goal");
    expect(prompt).toContain("Complexity");
    expect(prompt).toContain("Focus Sprint 1 strictly on Authentication and Payments.");
  });

  it("should mark SPRINT_PLAN document OUTDATED when parent requirement or test cases change", () => {
    const docs = [
      {
        id: "doc-tests",
        title: "Auth Test Cases",
        type: DocumentType.TEST_CASES,
        version: 2,
        parentDocumentId: null,
        updatedAt: "2026-07-20T14:00:00Z",
        lastGeneratedAt: "2026-07-20T10:00:00Z",
      },
      {
        id: "doc-sprint",
        title: "Sprint 1 Plan",
        type: DocumentType.SPRINT_PLAN,
        version: 1,
        parentDocumentId: "doc-tests",
        updatedAt: "2026-07-20T09:00:00Z",
        lastGeneratedAt: "2026-07-20T10:00:00Z", // Older timestamp than parent's updatedAt (14:00)
      },
    ];

    const graph = new DocumentGraph(docs as unknown as Document[]);
    const freshnessMap = ImpactAnalysisService.computeFreshnessMap(
      docs as unknown as Document[],
      graph
    );

    expect(freshnessMap.get("doc-sprint")).toBe(DocumentFreshness.OUTDATED);
  });
});
