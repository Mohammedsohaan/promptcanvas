export interface TraceModel {
  traceId: string;
  spanId: string;
  parentSpan?: string;
  duration: number; // ms
  status: "success" | "error";
  service: string;
  dependencies: string[];
}
