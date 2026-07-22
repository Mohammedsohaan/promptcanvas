import { PipelineContext } from "../../types/pipeline-context";
import { PlatformEventBus } from "../core/platform-event-bus";

export class PipelineCostService {
  public calculate(pipelineContext: PipelineContext): any {
    const pipelineCost = {
      buildMinutesCost: { amount: 150, currency: "USD" },
      testMinutesCost: { amount: 200, currency: "USD" },
      artifactStorageCost: { amount: 50, currency: "USD" },
      cacheStorageCost: { amount: 20, currency: "USD" },
      runnerCost: { amount: 300, currency: "USD" },
      retryCost: { amount: 30, currency: "USD" },
      deploymentCost: { amount: 100, currency: "USD" },
      environmentCost: { amount: 400, currency: "USD" }
    };
    PlatformEventBus.getInstance().publish("PipelineCostCalculated", pipelineCost);
    return pipelineCost;
  }
}
