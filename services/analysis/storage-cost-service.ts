import { ResourceCost } from "../../types/resource-cost";
import { PlatformEventBus } from "../core/platform-event-bus";

export class StorageCostService {
  public calculate(costs: ResourceCost[]): any {
    const storage = {
      blockStorage: { amount: 1200, currency: "USD" },
      objectStorage: { amount: 800, currency: "USD" },
      snapshots: { amount: 300, currency: "USD" },
      backups: { amount: 400, currency: "USD" },
      archives: { amount: 100, currency: "USD" },
      databaseStorage: { amount: 1500, currency: "USD" }
    };
    
    PlatformEventBus.getInstance().publish("StorageCostCalculated", storage);
    return storage;
  }
}
