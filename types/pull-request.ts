import { RepositoryDiff, FilePatch } from "./repository-diff";
import { ReviewRecommendation } from "./review-recommendation";

export interface DiffAnalysis {
  categories: {
    configuration: FilePatch[];
    infrastructure: FilePatch[];
    dependencies: FilePatch[];
    authentication: FilePatch[];
    authorization: FilePatch[];
    api: FilePatch[];
    database: FilePatch[];
    tests: FilePatch[];
    documentation: FilePatch[];
    cicd: FilePatch[];
    security: FilePatch[];
  };
  breakingChanges: FilePatch[];
  dependencyUpgrades: FilePatch[];
  migrationRequirements: FilePatch[];
  configurationRisks: FilePatch[];
  securitySensitiveChanges: FilePatch[];
  largeRefactors: FilePatch[];
}

export interface ImpactAnalysis {
  impactedPRDs: string[];
  impactedStories: string[];
  impactedAPIs: string[];
  impactedDatabaseSchemas: string[];
  impactedTestCases: string[];
  impactedSprintPlans: string[];
  generatedDocuments: string[];
  missingDownstreamArtifacts: string[];
  partialImplementations: string[];
}

export interface MergeReadiness {
  riskScore: number;
  mergeReadinessStatus: "ready" | "not_ready" | "warnings";
  architectureImpact: string;
  releaseDelta: string;
  securityImpact: string;
  warnings: string[];
  blockers: string[];
  reviewComplexity: "low" | "medium" | "high" | "critical";
  estimatedReviewMinutes: number;
  codeChurn: number;
  cyclomaticComplexityDelta: number;
  ownershipDistribution: Record<string, number>;
  documentationCoverage: number;
  testCoverageDelta: number;
  reviewConfidence: number;
}

export interface ReviewMetrics {
  totalFiles: number;
  riskScore: number;
  complexity: string;
  estimatedTime: number;
  testCoverageImpact: number;
  churnRate: number;
}

export interface PullRequestContext {
  metadata: {
    analyzedAt: string;
    version: string;
  };
  repositoryDiff: RepositoryDiff;
  diffAnalysis: DiffAnalysis;
  impactAnalysis: ImpactAnalysis;
  mergeReadiness: MergeReadiness;
  reviewRecommendation: ReviewRecommendation;
  repositoryAnalysis: any; // Integrates with existing RepositoryAnalysisService model
  architectureContext: any; // Integrates with ArchitectureContextService
  releaseContext: any; // Integrates with ReleaseContextService
  traceabilityContext: any; // Integrates with TraceabilityContextService
  semanticContext: any; // Semantic retrieval hits
  reviewMetrics: ReviewMetrics;
}
