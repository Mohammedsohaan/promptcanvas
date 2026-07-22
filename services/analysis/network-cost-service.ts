import { ResourceCost } from "../../types/resource-cost";
import { PlatformEventBus } from "../core/platform-event-bus";

export class NetworkCostService {
  public calculate(costs: ResourceCost[]): any {
    const network = {
      ingress: { amount: 50, currency: "USD" },
      egress: { amount: 800, currency: "USD" },
      loadBalancers: { amount: 300, currency: "USD" },
      natGateway: { amount: 200, currency: "USD" },
      vpn: { amount: 150, currency: "USD" },
      cdn: { amount: 400, currency: "USD" },
      interRegionTraffic: { amount: 250, currency: "USD" }
    };
    
    PlatformEventBus.getInstance().publish("NetworkCostCalculated", network);
    return network;
  }
}
