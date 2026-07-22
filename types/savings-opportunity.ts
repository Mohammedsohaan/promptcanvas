import { Cost } from "./cost";

export interface SavingsOpportunity {
  id: string;
  title: string;
  description: string;
  category: "compute" | "storage" | "network" | "kubernetes" | "idle_cleanup" | "architectural";
  monthlySavings: Cost;
  annualSavings: Cost;
  roiPercentage: number;
  confidence: "low" | "medium" | "high";
  difficulty: "low" | "medium" | "high";
  implementationTimeHours: number;
  resourcesAffected: string[];
}
