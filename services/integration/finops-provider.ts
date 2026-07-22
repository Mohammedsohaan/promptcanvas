import { BillingPeriod } from "../../types/billing-period";
import { CloudResource } from "../../types/cloud-resource";
import { ResourceCost } from "../../types/resource-cost";

export interface FinOpsProvider {
  providerName: string;
  
  fetchBillingSummary(period: BillingPeriod): Promise<any>;
  fetchResourceCosts(period: BillingPeriod): Promise<ResourceCost[]>;
  fetchResources(): Promise<CloudResource[]>;
  fetchCostAnomalies(period: BillingPeriod): Promise<any[]>;
  fetchSavingsOpportunities(): Promise<any[]>;
}
