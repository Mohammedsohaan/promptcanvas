import { TipTapStreamConsumer, CopilotStreamConsumer } from "../stream-consumer";
import { KeywordContextSelector, ProjectIndex } from "../context-selector";
import { buildProjectCopilotPrompt } from "../../lib/prompts/copilot";
import { MarkdownReferenceParser } from "../../lib/reference-parser";
import { DocumentType, DocumentFreshness, Document } from "../../types/document";
import { CopilotMode } from "../../types/ai";

// Helper to mock document repository data
const mockDoc = (id: string, title: string, type: DocumentType, parentId: string | null = null): Document => ({
  id,
  projectId: "proj-100",
  title,
  type,
  status: "READY" as any,
  version: 1,
  content: { text: `Content for ${title}` },
  icon: "FileText",
  isFavorite: false,
  sortOrder: 0,
  createdByAi: false,
  parentDocumentId: parentId,
  lastGeneratedAt: "2026-07-20T10:00:00Z",
  createdAt: "2026-07-19T10:00:00Z",
  updatedAt: "2026-07-19T10:00:00Z",
});

describe("AI Project Copilot Suite", () => {
  describe("StreamConsumer", () => {
    it("TipTapStreamConsumer should accumulate buffer and update callback", () => {
      let updatedText = "";
      const mockEditorRef = { current: { setEditable: jest.fn() } } as any;

      const consumer = new TipTapStreamConsumer(mockEditorRef, (text) => {
        updatedText = text;
      });

      consumer.onChunk("Hello ");
      consumer.onChunk("World");

      expect(consumer.getBuffer()).toBe("Hello World");
      expect(updatedText).toBe("Hello World");

      consumer.onComplete();
      expect(mockEditorRef.current.setEditable).toHaveBeenCalledWith(true);
    });

    it("CopilotStreamConsumer should stream chunks to callback", () => {
      const chunks: string[] = [];
      let completed = false;

      const consumer = new CopilotStreamConsumer({
        onChunk: (chunk) => chunks.push(chunk),
        onComplete: () => {
          completed = true;
        },
      });

      consumer.onChunk("Chunk 1");
      consumer.onChunk(" Chunk 2");
      consumer.onComplete();

      expect(consumer.getBuffer()).toBe("Chunk 1 Chunk 2");
      expect(chunks).toEqual(["Chunk 1", " Chunk 2"]);
      expect(completed).toBe(true);
    });
  });

  describe("KeywordContextSelector", () => {
    const mockIndex: ProjectIndex = {
      projectId: "proj-100",
      projectTitle: "Test Project",
      documents: [
        {
          id: "prd-1",
          title: "Product Requirements Document",
          type: DocumentType.PRD,
          version: 1,
          freshness: DocumentFreshness.UP_TO_DATE,
          parentDocumentId: null,
          childrenIds: ["stories-1"],
        },
        {
          id: "stories-1",
          title: "User Stories",
          type: DocumentType.USER_STORIES,
          version: 1,
          freshness: DocumentFreshness.UP_TO_DATE,
          parentDocumentId: "prd-1",
          childrenIds: ["api-1"],
        },
        {
          id: "api-1",
          title: "API Specification",
          type: DocumentType.API_SPEC,
          version: 1,
          freshness: DocumentFreshness.OUTDATED,
          parentDocumentId: "stories-1",
          childrenIds: ["db-1"],
        },
        {
          id: "db-1",
          title: "Database Schema",
          type: DocumentType.DATABASE_SCHEMA,
          version: 1,
          freshness: DocumentFreshness.UP_TO_DATE,
          parentDocumentId: "api-1",
          childrenIds: [],
        },
      ],
    };

    const selector = new KeywordContextSelector();

    it("should select API document for API question", async () => {
      const ids = await selector.selectRelevantDocuments(mockIndex, "Which APIs use JWT?");
      expect(ids).toContain("api-1");
    });

    it("should select Database document for database/table question", async () => {
      const ids = await selector.selectRelevantDocuments(
        mockIndex,
        "Which database tables support Orders?"
      );
      expect(ids).toContain("db-1");
    });

    it("should select outdated documents for freshness question", async () => {
      const ids = await selector.selectRelevantDocuments(mockIndex, "Which documents are outdated?");
      expect(ids).toContain("api-1");
    });

    it("should select root documents for broad summary question", async () => {
      const ids = await selector.selectRelevantDocuments(mockIndex, "Summarize this project.");
      expect(ids).toContain("prd-1");
      expect(ids).toContain("stories-1");
    });
  });

  describe("buildProjectCopilotPrompt", () => {
    it("should build structured prompt containing system rules, inventory, relevant docs, and reference requirements", () => {
      const prompt = buildProjectCopilotPrompt({
        mode: CopilotMode.GENERAL,
        question: "Explain authentication flow.",
        projectContext: {
          projectId: "proj-100",
          index: {
            projectId: "proj-100",
            projectTitle: "Test Project",
            documents: [
              {
                id: "prd-1",
                title: "PRD",
                type: DocumentType.PRD,
                version: 1,
                freshness: DocumentFreshness.UP_TO_DATE,
                parentDocumentId: null,
                childrenIds: [],
              },
            ],
          },
          relevantDocuments: [mockDoc("prd-1", "PRD", DocumentType.PRD)],
          graph: {} as any,
        },
      });

      expect(prompt).toContain("SYSTEM OBJECTIVE");
      expect(prompt).toContain("## Referenced Documents");
      expect(prompt).toContain("## Response Metadata");
      expect(prompt).toContain("Explain authentication flow.");
      expect(prompt).toContain("prd-1");
    });

    it("should build REVIEWER mode prompt containing consistency analyzer rules and deterministic context", () => {
      const prompt = buildProjectCopilotPrompt({
        mode: CopilotMode.REVIEWER,
        question: "Run a consistency analysis.",
        projectContext: {
          projectId: "proj-100",
          index: {
            projectId: "proj-100",
            projectTitle: "Test Project",
            documents: [
              {
                id: "prd-1",
                title: "PRD",
                type: DocumentType.PRD,
                version: 1,
                freshness: DocumentFreshness.UP_TO_DATE,
                parentDocumentId: null,
                childrenIds: [],
              },
            ],
          },
          relevantDocuments: [mockDoc("prd-1", "PRD", DocumentType.PRD)],
          graph: {} as any,
        },
        consistencyContext: {
          totalDocuments: 1,
          typeCounts: { PRD: 1 },
          freshnessCounts: { upToDate: 1, outdated: 0, unknown: 0 },
          outdatedDocuments: [],
          orphanDocuments: [],
          traceabilityGaps: [
            {
              sourceDocumentId: "prd-1",
              sourceTitle: "PRD",
              sourceType: DocumentType.PRD,
              missingChildType: DocumentType.USER_STORIES,
              description: "PRD has no linked User Stories",
            },
          ],
          versionMismatchCount: 0,
          coveragePercentage: 0,
        },
      });

      expect(prompt).toContain("CONSISTENCY ANALYZER INSTRUCTIONS (CopilotMode.REVIEWER)");
      expect(prompt).toContain("# Executive Summary");
      expect(prompt).toContain("## Project Health Indicators");
      expect(prompt).toContain("PRD has no linked User Stories");
    });

    it("should build TRACEABILITY mode prompt containing requirement traceability rules and chain context", () => {
      const prompt = buildProjectCopilotPrompt({
        mode: CopilotMode.TRACEABILITY,
        question: "Analyze requirement traceability.",
        projectContext: {
          projectId: "proj-100",
          index: {
            projectId: "proj-100",
            projectTitle: "Test Project",
            documents: [
              {
                id: "prd-1",
                title: "PRD Auth",
                type: DocumentType.PRD,
                version: 1,
                freshness: DocumentFreshness.UP_TO_DATE,
                parentDocumentId: null,
                childrenIds: [],
              },
            ],
          },
          relevantDocuments: [mockDoc("prd-1", "PRD Auth", DocumentType.PRD)],
          graph: {} as any,
        },
        traceabilityContext: {
          overallCoverage: 25,
          chains: [
            {
              id: "chain-prd-1",
              title: "PRD Auth",
              prdNode: {
                documentId: "prd-1",
                title: "PRD Auth",
                type: DocumentType.PRD,
                version: 1,
                freshness: "UP_TO_DATE",
              },
              userStoryNode: null,
              apiSpecNode: null,
              dbSchemaNode: null,
              currentStage: "PRD",
              missingStage: "User Story",
              status: "Broken",
              coveragePercentage: 25,
              relatedDocumentIds: ["prd-1"],
            },
          ],
          summary: {
            totalChains: 1,
            completeChains: 0,
            partialChains: 0,
            brokenChains: 1,
            missingUserStories: 1,
            missingApiSpecs: 0,
            missingDbSchemas: 0,
            unlinkedDocuments: [],
            healthScores: {
              requirementCoverage: "Critical",
              traceabilityHealth: "Critical",
              implementationProgress: "Critical",
              specificationCompleteness: "Critical",
              architectureReadiness: "Critical",
            },
          },
        },
      });

      expect(prompt).toContain("REQUIREMENT TRACEABILITY INSTRUCTIONS (CopilotMode.TRACEABILITY)");
      expect(prompt).toContain("Project Requirement Traceability Context");
      expect(prompt).toContain("Overall Requirement Coverage: 25%");
      expect(prompt).toContain("PRD Auth");
    });

    it("should build ARCHITECT mode prompt containing architecture instructions and context", () => {
      const prompt = buildProjectCopilotPrompt({
        mode: CopilotMode.ARCHITECT,
        question: "Review the overall software architecture and identify production risks.",
        projectContext: {
          projectId: "proj-100",
          index: {
            projectId: "proj-100",
            projectTitle: "Test Project",
            documents: [
              {
                id: "prd-1",
                title: "PRD Auth System",
                type: DocumentType.PRD,
                version: 1,
                freshness: DocumentFreshness.UP_TO_DATE,
                parentDocumentId: null,
                childrenIds: [],
              },
            ],
          },
          relevantDocuments: [mockDoc("prd-1", "PRD Auth System", DocumentType.PRD)],
          graph: {} as any,
        },
        architectureContext: {
          layers: { BusinessRequirements: 1, FunctionalStories: 0, InterfaceContracts: 0, PersistenceSchema: 0, CustomNotes: 0 },
          serviceCount: 1,
          dependencyDepth: 1,
          circularDependencies: [],
          singlePointsOfFailure: [],
          sharedComponents: [],
          authCoverage: true,
          apiCoverage: 100,
          databaseCoverage: 100,
          stats: {
            overallScore: 90,
            architectureQuality: "Excellent",
            scalability: "Excellent",
            security: "Excellent",
            maintainability: "Excellent",
            performance: "Excellent",
            technicalDebt: "Excellent",
            deploymentReadiness: "Excellent",
          },
        },
      });

      expect(prompt).toContain("ARCHITECTURE REVIEW INSTRUCTIONS (CopilotMode.ARCHITECT)");
      expect(prompt).toContain("Project Architecture Context");
      expect(prompt).toContain("Overall Architecture Score: 90 / 100");
      expect(prompt).toContain("PRD Auth System");
    });

    it("should build RELEASE mode prompt containing release instructions and aggregated context", () => {
      const prompt = buildProjectCopilotPrompt({
        mode: CopilotMode.RELEASE,
        question: "Evaluate whether this project is ready for implementation or production deployment.",
        projectContext: {
          projectId: "proj-100",
          index: {
            projectId: "proj-100",
            projectTitle: "Test Project",
            documents: [
              {
                id: "prd-1",
                title: "PRD Auth System",
                type: DocumentType.PRD,
                version: 1,
                freshness: DocumentFreshness.UP_TO_DATE,
                parentDocumentId: null,
                childrenIds: [],
              },
            ],
          },
          relevantDocuments: [mockDoc("prd-1", "PRD Auth System", DocumentType.PRD)],
          graph: {} as any,
        },
        releaseContext: {
          projectScore: 85,
          readinessPercentage: 85,
          status: "Ready",
          consistencyScore: 100,
          traceabilityScore: 80,
          architectureScore: 90,
          freshnessScore: 100,
          documentationScore: 90,
          criticalIssues: [],
          highPriorityIssues: [],
          mediumIssues: [],
          lowIssues: [],
          blockingRequirements: [],
          missingDocuments: [],
          brokenChains: [],
          architectureRisks: [],
          deploymentRisks: [],
          readyComponents: ["PRD Auth System"],
          stats: {
            overallReleaseScore: 85,
            consistency: "Excellent",
            traceability: "Good",
            architecture: "Excellent",
            documentation: "Excellent",
            freshness: "Excellent",
            deploymentReadiness: "Excellent",
          },
          consistencyContext: {} as any,
          traceabilityContext: {} as any,
          architectureContext: {} as any,
        },
      });

      expect(prompt).toContain("RELEASE READINESS INSTRUCTIONS (CopilotMode.RELEASE)");
      expect(prompt).toContain("Project Release Context");
      expect(prompt).toContain("Overall Release Score: 85 / 100");
      expect(prompt).toContain("Readiness Status: Ready");
    });
  });

  describe("MarkdownReferenceParser", () => {
    it("should incrementally parse streamed markdown reference sections", () => {
      const parser = new MarkdownReferenceParser();

      parser.consume("The authentication flow is defined in the PRD.\n\n");
      parser.consume("## Referenced Documents\n\n- id: prd-1\n  reason: Contains auth requirements\n  confidence: high\n");

      const refs = parser.finalize();
      expect(refs).toHaveLength(1);
      expect(refs[0].id).toBe("prd-1");
      expect(refs[0].reason).toBe("Contains auth requirements");
      expect(refs[0].confidence).toBe("high");
    });

    it("should handle multiple references and metadata cutoff", () => {
      const parser = new MarkdownReferenceParser();

      const text = `
Here is the explanation.

## Referenced Documents

- id: stories-1
  reason: Auth User Stories
  confidence: high

- id: api-1
  reason: Login Endpoint
  confidence: medium

## Response Metadata

reasoning_scope: project
confidence: high
`;

      parser.consume(text);
      const refs = parser.finalize();

      expect(refs).toHaveLength(2);
      expect(refs[0].id).toBe("stories-1");
      expect(refs[1].id).toBe("api-1");
      expect(refs[1].confidence).toBe("medium");
    });
  });
});
