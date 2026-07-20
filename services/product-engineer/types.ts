export type IntentType =
  | "generation"
  | "review"
  | "planning"
  | "repository_analysis"
  | "sync"
  | "mixed";

export type CapabilityType =
  | "generate_prd"
  | "generate_stories"
  | "generate_api"
  | "generate_schema"
  | "generate_test_cases"
  | "generate_sprint"
  | "check_consistency"
  | "check_traceability"
  | "check_architecture"
  | "check_release"
  | "check_repository"
  | "sync_engineering";

export type StepStatus = "pending" | "running" | "completed" | "failed" | "skipped";

export interface WorkflowStep {
  id: string;
  capability: CapabilityType;
  description: string;
  status: StepStatus;
  dependsOn?: string[];
  outputArtifactId?: string;
  errorMessage?: string;
}

export type WorkflowStatus = "idle" | "running" | "completed" | "failed";

export interface WorkflowPlan {
  id: string;
  intent: IntentType;
  summary: string;
  steps: WorkflowStep[];
  status: WorkflowStatus;
  createdAt: string;
  completedAt?: string;
}
