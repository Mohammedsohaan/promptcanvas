export interface PolicyDecision {
  status: "Allowed" | "Blocked" | "RequiresApproval" | "ManualReview";
  evaluatedPolicies: string[];
  reasons: string[];
  overridesAllowed: boolean;
}
