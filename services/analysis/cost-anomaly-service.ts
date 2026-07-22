import { PlatformEventBus } from "../core/platform-event-bus";
import { CostAnomaly } from "../../types/finops-context";
import { ResourceCost } from "../../types/resource-cost";

export class CostAnomalyService {
  public detect(costs: ResourceCost[]): CostAnomaly[] {
    const anomalies: CostAnomaly[] = [
      {
        id: "anomaly-1",
        type: "DailySpike",
        description: "Unusual EC2 usage spike on prod-web cluster",
        impactAmount: 150,
        currency: "USD",
        detectedAt: new Date().toISOString()
      }
    ];
    PlatformEventBus.getInstance().publish("CostAnomaliesDetected", anomalies);
    return anomalies;
  }
}
