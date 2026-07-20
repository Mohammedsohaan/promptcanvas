import { DocumentId, DocumentType } from "../types/document";
import { DocumentGraph } from "./document-graph";
import { ProjectIndex } from "./context-selector";

export interface RequirementChainNode {
  documentId: DocumentId;
  title: string;
  type: DocumentType | string;
  version: number;
  freshness: string;
}

export interface RequirementChain {
  id: string;
  title: string;
  prdNode: RequirementChainNode | null;
  userStoryNode: RequirementChainNode | null;
  apiSpecNode: RequirementChainNode | null;
  dbSchemaNode: RequirementChainNode | null;
  testCaseNode: RequirementChainNode | null;
  currentStage: "PRD" | "User Story" | "API Specification" | "Database Schema" | "Test Cases" | "None";
  missingStage: "User Story" | "API Specification" | "Database Schema" | "Test Cases" | "None";
  status: "Complete" | "Partial" | "Broken";
  coveragePercentage: number;
  relatedDocumentIds: DocumentId[];
}

export interface TraceabilitySummary {
  totalChains: number;
  completeChains: number;
  partialChains: number;
  brokenChains: number;
  missingUserStories: number;
  missingApiSpecs: number;
  missingDbSchemas: number;
  missingTestCases: number;
  unlinkedDocuments: Array<{ id: DocumentId; title: string; type: string }>;
  healthScores: {
    requirementCoverage: "Excellent" | "Good" | "Needs Attention" | "Critical";
    traceabilityHealth: "Excellent" | "Good" | "Needs Attention" | "Critical";
    implementationProgress: "Excellent" | "Good" | "Needs Attention" | "Critical";
    specificationCompleteness: "Excellent" | "Good" | "Needs Attention" | "Critical";
    architectureReadiness: "Excellent" | "Good" | "Needs Attention" | "Critical";
  };
}

export interface TraceabilityContext {
  overallCoverage: number;
  chains: RequirementChain[];
  summary: TraceabilitySummary;
}

/**
 * TraceabilityContextService produces deterministic requirement traceability information
 * across 5 stages: PRD -> User Story -> API Specification -> Database Schema -> Test Cases.
 */
export class TraceabilityContextService {
  public static compute(index: ProjectIndex, graph: DocumentGraph): TraceabilityContext {
    const prdItems = index.documents.filter(
      (d) => d.type === DocumentType.PRD || d.type === "PRD"
    );

    const chains: RequirementChain[] = [];
    const processedDocIds = new Set<DocumentId>();

    let completeCount = 0;
    let partialCount = 0;
    let brokenCount = 0;

    let missingStoriesCount = 0;
    let missingApisCount = 0;
    let missingSchemasCount = 0;
    let missingTestCasesCount = 0;

    // Build chains starting from each PRD document
    for (const prdItem of prdItems) {
      processedDocIds.add(prdItem.id);

      const prdNode: RequirementChainNode = {
        documentId: prdItem.id,
        title: prdItem.title,
        type: prdItem.type,
        version: prdItem.version,
        freshness: prdItem.freshness,
      };

      const children = graph.getChildren(prdItem.id);
      const storyDocs = children.filter(
        (c) => c.type === DocumentType.USER_STORIES || c.type === "USER_STORIES"
      );

      if (storyDocs.length === 0) {
        // Broken chain at PRD level
        missingStoriesCount++;
        brokenCount++;
        chains.push({
          id: `chain-${prdItem.id}`,
          title: prdItem.title,
          prdNode,
          userStoryNode: null,
          apiSpecNode: null,
          dbSchemaNode: null,
          testCaseNode: null,
          currentStage: "PRD",
          missingStage: "User Story",
          status: "Broken",
          coveragePercentage: 20,
          relatedDocumentIds: [prdItem.id],
        });
      } else {
        for (const storyDoc of storyDocs) {
          processedDocIds.add(storyDoc.id);

          const userStoryNode: RequirementChainNode = {
            documentId: storyDoc.id,
            title: storyDoc.title,
            type: storyDoc.type,
            version: storyDoc.version,
            freshness: (index.documents.find((d) => d.id === storyDoc.id)?.freshness as any) || "UP_TO_DATE",
          };

          const storyChildren = graph.getChildren(storyDoc.id);
          const apiDocs = storyChildren.filter(
            (c) => c.type === DocumentType.API_SPEC || c.type === "API_SPEC"
          );

          if (apiDocs.length === 0) {
            // Partial chain at User Story level
            missingApisCount++;
            partialCount++;
            chains.push({
              id: `chain-${storyDoc.id}`,
              title: `${prdItem.title} → ${storyDoc.title}`,
              prdNode,
              userStoryNode,
              apiSpecNode: null,
              dbSchemaNode: null,
              testCaseNode: null,
              currentStage: "User Story",
              missingStage: "API Specification",
              status: "Partial",
              coveragePercentage: 40,
              relatedDocumentIds: [prdItem.id, storyDoc.id],
            });
          } else {
            for (const apiDoc of apiDocs) {
              processedDocIds.add(apiDoc.id);

              const apiSpecNode: RequirementChainNode = {
                documentId: apiDoc.id,
                title: apiDoc.title,
                type: apiDoc.type,
                version: apiDoc.version,
                freshness: (index.documents.find((d) => d.id === apiDoc.id)?.freshness as any) || "UP_TO_DATE",
              };

              const apiChildren = graph.getChildren(apiDoc.id);
              const dbDocs = apiChildren.filter(
                (c) => c.type === DocumentType.DATABASE_SCHEMA || c.type === "DATABASE_SCHEMA"
              );

              if (dbDocs.length === 0) {
                // Partial chain at API Spec level
                missingSchemasCount++;
                partialCount++;
                chains.push({
                  id: `chain-${apiDoc.id}`,
                  title: `${storyDoc.title} → ${apiDoc.title}`,
                  prdNode,
                  userStoryNode,
                  apiSpecNode,
                  dbSchemaNode: null,
                  testCaseNode: null,
                  currentStage: "API Specification",
                  missingStage: "Database Schema",
                  status: "Partial",
                  coveragePercentage: 60,
                  relatedDocumentIds: [prdItem.id, storyDoc.id, apiDoc.id],
                });
              } else {
                for (const dbDoc of dbDocs) {
                  processedDocIds.add(dbDoc.id);

                  const dbSchemaNode: RequirementChainNode = {
                    documentId: dbDoc.id,
                    title: dbDoc.title,
                    type: dbDoc.type,
                    version: dbDoc.version,
                    freshness: (index.documents.find((d) => d.id === dbDoc.id)?.freshness as any) || "UP_TO_DATE",
                  };

                  const dbChildren = graph.getChildren(dbDoc.id);
                  const testDocs = dbChildren.filter(
                    (c) => c.type === DocumentType.TEST_CASES || c.type === "TEST_CASES"
                  );

                  if (testDocs.length === 0) {
                    missingTestCasesCount++;
                    partialCount++;
                    chains.push({
                      id: `chain-${dbDoc.id}`,
                      title: `${apiDoc.title} → ${dbDoc.title}`,
                      prdNode,
                      userStoryNode,
                      apiSpecNode,
                      dbSchemaNode,
                      testCaseNode: null,
                      currentStage: "Database Schema",
                      missingStage: "Test Cases",
                      status: "Partial",
                      coveragePercentage: 80,
                      relatedDocumentIds: [prdItem.id, storyDoc.id, apiDoc.id, dbDoc.id],
                    });
                  } else {
                    for (const testDoc of testDocs) {
                      processedDocIds.add(testDoc.id);

                      const testCaseNode: RequirementChainNode = {
                        documentId: testDoc.id,
                        title: testDoc.title,
                        type: testDoc.type,
                        version: testDoc.version,
                        freshness: (index.documents.find((d) => d.id === testDoc.id)?.freshness as any) || "UP_TO_DATE",
                      };

                      completeCount++;
                      chains.push({
                        id: `chain-${testDoc.id}`,
                        title: `${dbDoc.title} → ${testDoc.title}`,
                        prdNode,
                        userStoryNode,
                        apiSpecNode,
                        dbSchemaNode,
                        testCaseNode,
                        currentStage: "Test Cases",
                        missingStage: "None",
                        status: "Complete",
                        coveragePercentage: 100,
                        relatedDocumentIds: [prdItem.id, storyDoc.id, apiDoc.id, dbDoc.id, testDoc.id],
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // Find unlinked documents not processed in any chain
    const unlinkedDocuments = index.documents
      .filter((d) => !processedDocIds.has(d.id))
      .map((d) => ({ id: d.id, title: d.title, type: d.type as string }));

    const totalChains = chains.length;
    const overallCoverage =
      totalChains > 0
        ? Math.round(
            chains.reduce((acc, c) => acc + c.coveragePercentage, 0) / totalChains
          )
        : 0;

    // Helper for health score rating
    const getRating = (percentage: number): "Excellent" | "Good" | "Needs Attention" | "Critical" => {
      if (percentage >= 90) return "Excellent";
      if (percentage >= 70) return "Good";
      if (percentage >= 50) return "Needs Attention";
      return "Critical";
    };

    return {
      overallCoverage,
      chains,
      summary: {
        totalChains,
        completeChains: completeCount,
        partialChains: partialCount,
        brokenChains: brokenCount,
        missingUserStories: missingStoriesCount,
        missingApiSpecs: missingApisCount,
        missingDbSchemas: missingSchemasCount,
        missingTestCases: missingTestCasesCount,
        unlinkedDocuments,
        healthScores: {
          requirementCoverage: getRating(overallCoverage),
          traceabilityHealth: getRating(
            totalChains > 0 ? Math.round((completeCount / totalChains) * 100) : 0
          ),
          implementationProgress: getRating(
            totalChains > 0 ? Math.round(((completeCount + partialCount * 0.5) / totalChains) * 100) : 0
          ),
          specificationCompleteness: getRating(
            missingStoriesCount + missingApisCount + missingSchemasCount + missingTestCasesCount === 0 ? 100 : 60
          ),
          architectureReadiness: getRating(overallCoverage),
        },
      },
    };
  }
}
