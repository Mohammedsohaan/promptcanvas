export interface ServiceTopology {
  serviceName: string;
  upstreamServices: string[];
  downstreamServices: string[];
  databases: string[];
  caches: string[];
  queues: string[];
  externalAPIs: string[];
  regions: string[];
  availabilityZones: string[];
  criticalPaths: string[];
}
