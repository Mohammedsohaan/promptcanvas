import { PipelineModel } from "./pipeline";
import { QualityGateResult } from "./quality-gate";
import { PipelineRecommendation } from "./pipeline-recommendation";
import { RepositoryDiff } from "./repository-diff";
import { PullRequestContext } from "./pull-request";
import { ArtifactModel } from "./artifact";

export interface PipelineAnalysis {
  executionDuration: number;
  queueTime: number;
  stageSuccessRate: number;
  failedStages: string[];
  skippedStages: string[];
  flakyJobs: string[];
  retryFrequency: number;
  artifactGenerationStatus: string;
  deploymentTargets: string[];
  parallelism: number;
  pipelineEfficiency: number;
  historicalSuccessRate: number;
  historicalFailureTrend: "increasing" | "decreasing" | "stable" | "unknown";
  deploymentFrequency: number;
  averageBuildTime: number;
  averageRecoveryTime: number;
}

export interface ArtifactAnalysis {
  artifactIntegrity: boolean;
  checksumValid: boolean;
  signedValid: boolean;
  versionConsistency: boolean;
  missingArtifacts: string[];
  duplicateArtifacts: string[];
  containerImageValidation: "passed" | "failed" | "warning" | "not_applicable";
  sbomAvailability: boolean;
}

export interface DeploymentRisk {
  deploymentRisk: "low" | "medium" | "high" | "critical";
  rollbackRisk: "low" | "medium" | "high" | "critical";
  databaseMigrationRisk: "low" | "medium" | "high" | "critical" | "not_applicable";
  apiCompatibility: "compatible" | "breaking" | "unknown";
  configurationDrift: boolean;
  infrastructureDrift: boolean;
  environmentDrift: boolean;
  dependencyRisk: "low" | "medium" | "high" | "critical";
}

export interface ReleaseValidation {
  releaseReadiness: "ready" | "not_ready" | "conditionally_ready";
  missingApprovals: string[];
  missingRollbackPlan: boolean;
  missingDocumentation: boolean;
  missingTests: boolean;
  missingMonitoring: boolean;
  missingAlerting: boolean;
  missingRunbook: boolean;
}

export interface PipelineContext {
  metadata: {
    analyzedAt: string;
    version: string;
  };
  pipelineModel: PipelineModel;
  pipelineAnalysis: PipelineAnalysis;
  qualityGate: QualityGateResult;
  artifactAnalysis: ArtifactAnalysis;
  deploymentRisk: DeploymentRisk;
  releaseValidation: ReleaseValidation;
  pipelineRecommendation: PipelineRecommendation;
  repositoryDiff?: RepositoryDiff;
  pullRequestContext?: PullRequestContext;
  architectureContext?: any;
  releaseContext?: any;
}
