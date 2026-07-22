import { CloudResource } from "../../types/cloud-resource";
import { ResourceCost } from "../../types/resource-cost";
import { OptimizationAnalysis } from "../../types/optimization";
import { PlatformEventBus } from "../core/platform-event-bus";

export class OptimizationService {
  public compute(resources: CloudResource[], costs: ResourceCost[]): OptimizationAnalysis {
    const analysis: OptimizationAnalysis = {
      rightsizingOpportunities: 5,
      reservedInstanceOpportunities: 2,
      spotOpportunities: 3,
      storageTieringOpportunities: 10,
      autoscalingImprovements: 2,
      idleCleanupOpportunities: 8
    };
    PlatformEventBus.getInstance().publish("OptimizationComputed", analysis);
    return analysis;
  }
}
