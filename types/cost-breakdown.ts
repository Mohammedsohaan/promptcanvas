import { Cost } from "./cost";

export interface CostBreakdown {
  category: string;
  cost: Cost;
  percentageOfTotal: number;
  trend: "up" | "down" | "flat";
  trendPercentage: number;
}
