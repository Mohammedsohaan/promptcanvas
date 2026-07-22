import { CloudResource } from "../../types/cloud-resource";
import { PlatformEventBus } from "../core/platform-event-bus";

export class ResourceAnalysisService {
  public analyze(resources: CloudResource[]): any {
    const analysis = {
      totalResources: resources.length,
      idleResources: resources.filter(r => r.status === "idle"),
      unusedVolumes: resources.filter(r => r.type === "Volume" && (r.status as string) === "available"),
      unusedSnapshots: resources.filter(r => r.type === "Snapshot" && r.tags?.unused === "true"),
      unusedLoadBalancers: resources.filter(r => r.type === "LoadBalancer" && r.status === "idle"),
      cpuUsagePercentage: 45,
      memoryUsagePercentage: 60,
      gpuUsagePercentage: 10,
      storageUsageGB: 5000,
      databaseUsagePercentage: 70,
      cacheUsagePercentage: 40,
      queueUsageMessages: 10000,
      networkUsageGB: 2000
    };
    
    PlatformEventBus.getInstance().publish("ResourcesAnalyzed", analysis);
    return analysis;
  }
}
