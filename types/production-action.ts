export type ProductionActionType = 
  | "RestartService"
  | "ScaleDeployment"
  | "PauseDeployment"
  | "ResumeDeployment"
  | "InvalidateCache"
  | "RestartWorker"
  | "ClearQueue"
  | "RotateSecrets";

export interface ProductionAction {
  id: string;
  type: ProductionActionType;
  target: string;
  parameters: Record<string, unknown>;
  isDryRun: boolean;
}
