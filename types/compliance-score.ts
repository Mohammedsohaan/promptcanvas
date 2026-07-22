export interface ComplianceScore {
  overallScore: number;
  policyCoverage: number;
  controlCoverage: number;
  auditCompleteness: number;
  approvalCoverage: number;
  operationalReadiness: number;
  securityReadiness: number;
  governanceReadiness: number;
}
