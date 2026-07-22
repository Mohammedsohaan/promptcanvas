import { SecurityModel } from "./security";
import { SecurityRisk } from "./security-risk";
import { SecurityRecommendation } from "./security-recommendation";
import { RepositoryDiff } from "./repository-diff";
import { PullRequestContext } from "./pull-request";
import { PipelineContext } from "./pipeline-context";
import { RuntimeContext } from "./runtime-context";
import { SecurityFinding } from "./security-finding";
import { Vulnerability } from "./vulnerability";
import { ContainerSecurityResult } from "./container-security";
import { ArtifactIntegrityResult } from "./artifact-integrity";

export interface SecretAnalysisResult {
  hardcodedSecrets: number;
  apiKeys: number;
  passwords: number;
  privateKeys: number;
  tokens: number;
  credentialExposures: SecurityFinding[];
  leakSeverity: "critical" | "high" | "medium" | "low" | "none";
}

export interface DependencySecurityResult {
  outdatedPackages: number;
  knownVulnerabilities: number;
  criticalDependencies: string[];
  licenseRisks: string[];
  transitiveRisks: number;
}

export interface SBOMAnalysisResult {
  missingComponents: string[];
  versionDrift: boolean;
  unsignedPackages: number;
  supplyChainRisk: "critical" | "high" | "medium" | "low";
}

export interface RuntimeThreatResult {
  suspiciousActivity: boolean;
  privilegeEscalation: boolean;
  unexpectedNetworkCalls: boolean;
  maliciousProcessDetection: boolean;
  persistenceIndicators: boolean;
  threatLevel: "critical" | "high" | "medium" | "low" | "none";
}

export interface PolicyComplianceResult {
  overallCompliance: "compliant" | "non_compliant" | "partial";
  failedPolicies: string[];
  advisoryPolicies: string[];
  encryptionStatus: "enforced" | "partial" | "missing";
  secretsManagement: "enforced" | "partial" | "missing";
}

export interface SecurityContext {
  metadata: {
    analyzedAt: string;
    version: string;
  };
  securityModel: SecurityModel;
  secretAnalysis: SecretAnalysisResult;
  dependencySecurity: DependencySecurityResult;
  vulnerabilities: Vulnerability[];
  sbomAnalysis: SBOMAnalysisResult;
  artifactIntegrity: ArtifactIntegrityResult;
  containerSecurity: ContainerSecurityResult;
  runtimeThreats: RuntimeThreatResult;
  policyCompliance: PolicyComplianceResult;
  securityRisk: SecurityRisk;
  securityRecommendation: SecurityRecommendation;
  repositoryDiff?: RepositoryDiff;
  pullRequestContext?: PullRequestContext;
  pipelineContext?: PipelineContext;
  runtimeContext?: RuntimeContext;
}
