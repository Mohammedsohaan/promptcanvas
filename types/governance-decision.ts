export interface GovernanceDecision {
  status: "Allowed" | "Blocked" | "Requires Approval" | "Manual Review";
  reason: string;
  evaluatedPolicies: string[];
  timestamp: string;
}
