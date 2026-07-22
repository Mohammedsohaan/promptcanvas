export interface OrganizationGoal {
  id: string;
  title: string;
  progressPercent: number;
  targetDate: string;
  status: "OnTrack" | "AtRisk" | "Delayed" | "Completed";
}
