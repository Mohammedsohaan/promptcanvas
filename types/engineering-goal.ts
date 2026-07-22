export interface EngineeringGoal {
  id: string;
  category: "Reliability" | "Availability" | "Security" | "Compliance" | "Cost" | "Performance" | "Delivery" | "Operational";
  title: string;
  target: number;
  current: number;
  status: "OnTrack" | "AtRisk" | "OffTrack" | "Completed";
  progressPercentage: number;
  owner: string;
}
