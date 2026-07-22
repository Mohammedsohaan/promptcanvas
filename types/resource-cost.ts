import { Cost } from "./cost";

export interface ResourceCost {
  resourceId: string;
  resourceName: string;
  service: string;
  cost: Cost;
  region?: string;
  tags: Record<string, string>;
}
