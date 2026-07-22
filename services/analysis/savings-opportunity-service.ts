import { PlatformEventBus } from "../core/platform-event-bus";
import { SavingsOpportunity } from "../../types/savings-opportunity";
import { OptimizationAnalysis } from "../../types/optimization";

export class SavingsOpportunityService {
  public compute(optimization: OptimizationAnalysis): SavingsOpportunity[] {
    const savings: SavingsOpportunity[] = [
      {
        id: "savings-1",
        title: "Downsize underutilized EC2 instances",
        description: "Scale down 5 instances in prod-web based on historical memory usage.",
        category: "compute",
        monthlySavings: { amount: 200, currency: "USD" },
        annualSavings: { amount: 2400, currency: "USD" },
        roiPercentage: 150,
        confidence: "high",
        difficulty: "low",
        implementationTimeHours: 2,
        resourcesAffected: ["i-123", "i-456"]
      }
    ];
    PlatformEventBus.getInstance().publish("SavingsCalculated", savings);
    return savings;
  }
}
