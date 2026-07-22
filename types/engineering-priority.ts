export interface EngineeringPriority {
  id: string;
  level: "Critical" | "High" | "Medium" | "Low" | "Backlog";
  title: string;
  description: string;
  businessImpact: string;
  engineeringImpact: string;
  operationalImpact: string;
  securityImpact: string;
  estimatedEffort: string;
  dependencies: string[];
}
