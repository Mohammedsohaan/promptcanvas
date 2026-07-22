import { FinOpsProvider } from "./finops-provider";
import { PlatformEventBus } from "../core/platform-event-bus";
import { BillingPeriod } from "../../types/billing-period";

export class FinOpsConnector {
  constructor(private provider: FinOpsProvider) {}

  public async collect(period: BillingPeriod): Promise<{
    billingSummary: any;
    resourceCosts: any[];
    resources: any[];
    anomalies: any[];
    savings: any[];
  }> {
    PlatformEventBus.getInstance().publish("CostScanStarted", { provider: this.provider.providerName, period });

    const [billingSummary, resourceCosts, resources, anomalies, savings] = await Promise.all([
      this.provider.fetchBillingSummary(period),
      this.provider.fetchResourceCosts(period),
      this.provider.fetchResources(),
      this.provider.fetchCostAnomalies(period),
      this.provider.fetchSavingsOpportunities()
    ]);

    PlatformEventBus.getInstance().publish("BillingFetched", { provider: this.provider.providerName, period });

    return {
      billingSummary,
      resourceCosts,
      resources,
      anomalies,
      savings
    };
  }
}
