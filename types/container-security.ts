export interface ContainerSecurityResult {
  baseImageRisk: "critical" | "high" | "medium" | "low" | "safe";
  criticalCVEs: number;
  privilegeEscalation: boolean;
  rootContainers: boolean;
  misconfigurations: string[];
}
