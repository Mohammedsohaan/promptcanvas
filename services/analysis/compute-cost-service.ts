import { ResourceCost } from "../../types/resource-cost";
import { PlatformEventBus } from "../core/platform-event-bus";

export class ComputeCostService {
  public calculate(costs: ResourceCost[]): any {
    const compute = {
      vmCost: { amount: 5000, currency: "USD" },
      containerCost: { amount: 2000, currency: "USD" },
      serverlessCost: { amount: 500, currency: "USD" },
      gpuCost: { amount: 1000, currency: "USD" },
      reservedInstancesCost: { amount: 3000, currency: "USD" },
      spotCost: { amount: 200, currency: "USD" },
      onDemandCost: { amount: 5300, currency: "USD" }
    };
    
    PlatformEventBus.getInstance().publish("ComputeCostCalculated", compute);
    return compute;
  }
}
