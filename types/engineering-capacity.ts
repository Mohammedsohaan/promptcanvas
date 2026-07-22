export interface EngineeringCapacity {
  currentCapacity: number;
  plannedCapacity: number;
  engineeringLoad: number;
  activeProjects: number;
  utilization: number;
  deliveryThroughput: number;
  remainingCapacity: number;
  bottlenecks: string[];
}
