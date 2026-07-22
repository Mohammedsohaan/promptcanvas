export interface MetricModel {
  CPU: number; // percentage
  Memory: number; // percentage
  Disk: number; // percentage
  Network: number; // bytes per second
  Latency: number; // ms average
  P50: number; // ms
  P95: number; // ms
  P99: number; // ms
  ErrorRate: number; // percentage
  RequestRate: number; // requests per second
  CacheHitRate: number; // percentage
  QueueDepth: number; // count
}
