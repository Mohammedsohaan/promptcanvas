export interface GovernancePolicy {
  id: string;
  name: string;
  type: "Deployment" | "Approval" | "Freeze" | "Maintenance" | "SegregationOfDuties" | "Emergency";
  enforced: boolean;
  conditions: Record<string, unknown>;
}
