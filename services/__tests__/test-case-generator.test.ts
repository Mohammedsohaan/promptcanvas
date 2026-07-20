import { DocumentType, DocumentFreshness } from "../../types/document";
import { buildTestCasesPrompt } from "../../lib/prompts/test-cases";
import { TraceabilityContextService } from "../traceability-context";
import { DocumentGraph } from "../document-graph";
import { ProjectIndex } from "../context-selector";
import { ImpactAnalysisService } from "../impact-analysis";

describe("TestCaseGenerator & 5-Stage Traceability", () => {
  it("should build structured test case prompt correctly", () => {
    const prompt = buildTestCasesPrompt({
      parentDocumentTitle: "Order Checkout API",
      parentDocumentType: "API_SPEC",
      parentDocumentContent: "POST /api/orders/checkout",
      additionalInstructions: "Include edge case tests for payment timeout.",
    });

    expect(prompt).toContain("Order Checkout API");
    expect(prompt).toContain("Functional Test Cases");
    expect(prompt).toContain("Negative & Boundary Test Cases");
    expect(prompt).toContain("Include edge case tests for payment timeout.");
  });

  it("should include Test Cases as the 5th stage in TraceabilityContextService", () => {
    const index: ProjectIndex = {
      projectId: "proj-tc-test",
      projectTitle: "E-Commerce System",
      documents: [
        {
          id: "doc-prd",
          title: "E-Commerce PRD",
          type: DocumentType.PRD,
          version: 1,
          freshness: DocumentFreshness.UP_TO_DATE,
          parentDocumentId: null,
          childrenIds: ["doc-story"],
        },
        {
          id: "doc-story",
          title: "Order Checkout Story",
          type: DocumentType.USER_STORIES,
          version: 1,
          freshness: DocumentFreshness.UP_TO_DATE,
          parentDocumentId: "doc-prd",
          childrenIds: ["doc-api"],
        },
        {
          id: "doc-api",
          title: "Order Checkout API Spec",
          type: DocumentType.API_SPEC,
          version: 1,
          freshness: DocumentFreshness.UP_TO_DATE,
          parentDocumentId: "doc-story",
          childrenIds: ["doc-db"],
        },
        {
          id: "doc-db",
          title: "Order DB Schema",
          type: DocumentType.DATABASE_SCHEMA,
          version: 1,
          freshness: DocumentFreshness.UP_TO_DATE,
          parentDocumentId: "doc-api",
          childrenIds: ["doc-tests"],
        },
        {
          id: "doc-tests",
          title: "Order Test Cases",
          type: DocumentType.TEST_CASES,
          version: 1,
          freshness: DocumentFreshness.UP_TO_DATE,
          parentDocumentId: "doc-db",
          childrenIds: [],
        },
      ],
    };

    const graph = new DocumentGraph(index.documents as any);
    const traceability = TraceabilityContextService.compute(index, graph);

    expect(traceability.chains).toHaveLength(1);
    const chain = traceability.chains[0];
    expect(chain.status).toBe("Complete");
    expect(chain.coveragePercentage).toBe(100);
    expect(chain.testCaseNode?.title).toBe("Order Test Cases");
  });

  it("should mark Test Case document OUTDATED when parent DB Schema or API Spec changes", () => {
    const docs = [
      {
        id: "doc-api",
        title: "Auth API Spec",
        type: DocumentType.API_SPEC,
        version: 2,
        parentDocumentId: null,
        updatedAt: "2026-07-20T12:00:00Z",
        lastGeneratedAt: "2026-07-20T10:00:00Z",
      },
      {
        id: "doc-tests",
        title: "Auth Test Cases",
        type: DocumentType.TEST_CASES,
        version: 1,
        parentDocumentId: "doc-api",
        updatedAt: "2026-07-20T09:00:00Z",
        lastGeneratedAt: "2026-07-20T10:00:00Z", // Older timestamp than parent's updatedAt (12:00)
      },
    ];

    const graph = new DocumentGraph(docs as any);
    const freshnessMap = ImpactAnalysisService.computeFreshnessMap(docs as any, graph);

    expect(freshnessMap.get("doc-tests")).toBe(DocumentFreshness.OUTDATED);
  });
});
