export interface ServiceModel {
  name: string;
  version: string;
  status: "healthy" | "degraded" | "unhealthy" | "offline" | "unknown";
  replicas: number;
  uptime: number; // in milliseconds
  availability: number; // percentage
  environment: string;
  deploymentVersion: string;
}
