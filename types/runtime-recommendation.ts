export interface RuntimeRecommendation {
  severity: "critical" | "high" | "medium" | "low" | "info";
  recommendation: string;
  nextActions: string[];
  rollbackRecommendation: boolean;
  scaleRecommendation: "scale_up" | "scale_down" | "maintain";
  incidentPriority: "P1" | "P2" | "P3" | "P4" | "P5" | "none";
}
