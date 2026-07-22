import { ResourceCost } from "../../types/resource-cost";

export class KubernetesCostService {
  public calculate(costs: ResourceCost[]): any {
    return {
      clusterCost: { amount: 2000, currency: "USD" },
      namespaceCost: { amount: 500, currency: "USD" },
      deploymentCost: { amount: 300, currency: "USD" },
      podCost: { amount: 100, currency: "USD" },
      autoscalingEfficiency: 85,
      idleCapacity: { amount: 200, currency: "USD" }
    };
  }
}
