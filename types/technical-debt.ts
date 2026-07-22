export interface TechnicalDebtItem {
  id: string;
  category: "CodeQuality" | "Security" | "Infrastructure" | "Pipeline" | "Operational" | "Documentation";
  title: string;
  severity: "High" | "Medium" | "Low";
  remediationCostHours: number;
}

export interface TechnicalDebt {
  totalDebtHours: number;
  items: TechnicalDebtItem[];
  timestamp: string;
}
