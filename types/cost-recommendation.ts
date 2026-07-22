import { Cost } from "./cost";

export interface CostRecommendation {
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  immediateSavings: Cost;
  longTermSavings: Cost;
  optimizationPlan: string;
  executiveSummary: string;
  deploymentAdvice: string;
}
