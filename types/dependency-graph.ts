export enum DependencyNodeType {
  Repository = "Repository",
  Project = "Project",
  Service = "Service",
  Pipeline = "Pipeline",
  Library = "Library",
  Infrastructure = "Infrastructure",
  Deployment = "Deployment",
  Database = "Database",
  Queue = "Queue",
  API = "API",
  Cache = "Cache",
  Secret = "Secret"
}

export interface DependencyNode {
  id: string;
  type: DependencyNodeType;
  name: string;
}

export interface DependencyEdge {
  source: string;
  target: string;
  relationship: string;
  criticality: "High" | "Medium" | "Low";
  direction: "Inbound" | "Outbound" | "Bidirectional";
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}
