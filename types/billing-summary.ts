import { Cost } from "./cost";

export interface BillingSummary {
  currentSpend: Cost;
  forecastSpend: Cost;
  budget: Cost;
  budgetUtilizationPercentage: number;
  dailyBurnRate: Cost;
  projectedMonthEndSpend: Cost;
  remainingBudget: Cost;
}
