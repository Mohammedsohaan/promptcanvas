export interface ComplianceViolations {
  ruleId: string;
  description: string;
  severity: string;
}

export interface ComplianceResult {
  status: "Compliant" | "NonCompliant" | "Warning";
  violations: ComplianceViolations[];
  evaluatedRulesCount: number;
  timestamp: string;
}
