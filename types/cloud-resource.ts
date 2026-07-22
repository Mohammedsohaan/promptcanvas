export interface CloudResource {
  id: string;
  name: string;
  type: string;
  provider: string;
  region: string;
  status: "running" | "stopped" | "terminated" | "idle" | "unknown";
  tags: Record<string, string>;
}
