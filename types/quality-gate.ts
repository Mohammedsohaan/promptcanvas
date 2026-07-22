export interface QualityGateResult {
  status: "passed" | "failed" | "warning" | "skipped";
  lintStatus: "passed" | "failed" | "warning" | "NOT_AVAILABLE";
  unitTests: "passed" | "failed" | "warning" | "NOT_AVAILABLE";
  integrationTests: "passed" | "failed" | "warning" | "NOT_AVAILABLE";
  coverage: number | "NOT_AVAILABLE";
  staticAnalysis: "passed" | "failed" | "warning" | "NOT_AVAILABLE";
  dependencyAudit: "passed" | "failed" | "warning" | "NOT_AVAILABLE";
  securityScan: "passed" | "failed" | "warning" | "NOT_AVAILABLE";
  licenseScan: "passed" | "failed" | "warning" | "NOT_AVAILABLE";
  containerScan: "passed" | "failed" | "warning" | "NOT_AVAILABLE";
  infrastructureScan: "passed" | "failed" | "warning" | "NOT_AVAILABLE";
  secretScan: "passed" | "failed" | "warning" | "NOT_AVAILABLE";
  iacValidation: "passed" | "failed" | "warning" | "NOT_AVAILABLE";
  policyCompliance: "passed" | "failed" | "warning" | "NOT_AVAILABLE";
  sbomGeneration: "passed" | "failed" | "warning" | "NOT_AVAILABLE";
}
