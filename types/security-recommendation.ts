export interface SecurityRecommendation {
  priority: "P1" | "P2" | "P3" | "P4";
  immediateActions: string[];
  remediationSteps: string[];
  longTermImprovements: string[];
  deploymentRecommendation: "block" | "proceed_with_caution" | "safe";
}
