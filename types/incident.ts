export interface IncidentModel {
  id: string;
  title: string;
  status: "investigating" | "identified" | "monitoring" | "resolved" | "closed";
  severity: "SEV-1" | "SEV-2" | "SEV-3" | "SEV-4" | "SEV-5";
  startTime: string;
  resolvedTime?: string;
  affectedServices: string[];
  rootCause?: string;
  triggerAlerts: string[];
}
