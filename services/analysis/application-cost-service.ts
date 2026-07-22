import { RuntimeContext } from "../../types/runtime-context";

export class ApplicationCostService {
  public calculate(runtimeContext: RuntimeContext): any {
    return {
      perServiceCost: { amount: 1000, currency: "USD" },
      requestCost: { amount: 0.001, currency: "USD" },
      scalingCost: { amount: 50, currency: "USD" },
      latencyCost: { amount: 20, currency: "USD" },
      runtimeResourceConsumption: 80
    };
  }
}
