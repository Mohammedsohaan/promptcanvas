export interface EnvironmentModel {
  environmentName: string;
  environmentType: "development" | "staging" | "production" | "ephemeral";
  configurationVersion: string;
  secretStatus: "valid" | "expired" | "missing" | "unknown";
  infrastructureVersion: string;
  deploymentHistory: string[];
  healthStatus: "healthy" | "degraded" | "unhealthy" | "unknown";
  cluster?: string;
  region?: string;
}
