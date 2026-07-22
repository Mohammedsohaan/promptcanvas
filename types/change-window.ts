export interface ChangeWindow {
  id: string;
  type: "DeploymentWindow" | "MaintenanceWindow" | "ProductionFreeze" | "Holiday" | "RegionalRestriction";
  startTime: string;
  endTime: string;
  isActive: boolean;
  reason: string;
}
