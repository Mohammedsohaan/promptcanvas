export interface PipelineRecommendation {
  decision: "proceed" | "block" | "warn" | "manual_intervention_required";
  blockers: string[];
  warnings: string[];
  nextActions: string[];
  deploymentStrategy: "Rolling" | "BlueGreen" | "Canary" | "Shadow" | "Recreate" | "Hold";
  rollbackStrategy: "Automatic" | "Manual" | "Phased" | "None";
}
