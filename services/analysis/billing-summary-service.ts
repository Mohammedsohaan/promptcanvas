import { PlatformEventBus } from "../core/platform-event-bus";
import { BillingSummary } from "../../types/billing-summary";

export class BillingSummaryService {
  public compute(billingData: any): BillingSummary {
    const summary: BillingSummary = {
      currentSpend: billingData.currentSpend || { amount: 0, currency: "USD" },
      forecastSpend: billingData.forecastSpend || { amount: 0, currency: "USD" },
      budget: billingData.budget || { amount: 0, currency: "USD" },
      budgetUtilizationPercentage: billingData.budgetUtilizationPercentage || 0,
      dailyBurnRate: billingData.dailyBurnRate || { amount: 0, currency: "USD" },
      projectedMonthEndSpend: billingData.projectedMonthEndSpend || { amount: 0, currency: "USD" },
      remainingBudget: billingData.remainingBudget || { amount: 0, currency: "USD" }
    };
    PlatformEventBus.getInstance().publish("BillingSummaryComputed", summary);
    return summary;
  }
}
