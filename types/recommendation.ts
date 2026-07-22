export interface Recommendation {
  id: string;
  category: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  reason: string;
  supportingMetrics: Record<string, unknown>;
  expectedBenefit: string;
  estimatedEffort: string;
  dependencies: string[];
}
