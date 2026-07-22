export interface ReleaseReadiness {
  isReady: boolean;
  overallScore: number;
  repositoryReadiness: string;
  pipelineReadiness: string;
  runtimeReadiness: string;
  securityReadiness: string;
  finopsReadiness: string;
  complianceReadiness: string;
  approvalReadiness: string;
  blockingIssues: string[];
  timestamp: string;
}
