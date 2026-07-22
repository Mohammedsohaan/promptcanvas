export interface LogModel {
  timestamp: string;
  severity: "INFO" | "WARN" | "ERROR" | "DEBUG" | "FATAL";
  service: string;
  traceId?: string;
  requestId?: string;
  message: string;
  structuredFields: Record<string, any>;
}
