import { PlatformEventBus } from "../core/platform-event-bus";
import { CostRecommendation } from "../../types/cost-recommendation";

export class CostRecommendationService {
  public generate(savings: any[], score: any): CostRecommendation[] {
    const recommendations: CostRecommendation[] = [
      {
        priority: "high",
        title: "Immediate Right-sizing",
        description: "Optimize EC2 compute layer",
        immediateSavings: { amount: 500, currency: "USD" },
        longTermSavings: { amount: 6000, currency: "USD" },
        optimizationPlan: "1. Audit instances\n2. Resize",
        executiveSummary: "Considerable savings found in the compute layer.",
        deploymentAdvice: "Roll out instance type changes in staging first."
      }
    ];
    PlatformEventBus.getInstance().publish("CostRecommendationGenerated", recommendations);
    return recommendations;
  }
}
