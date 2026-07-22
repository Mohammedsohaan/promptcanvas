export type PluginStatus = "uninitialized" | "loaded" | "failed" | "stopped" | "error";

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  dependencies: string[];
  capabilities?: string[];
  workflows?: string[];
  analyses?: string[];
  connectors?: string[];
  status: PluginStatus;

  // v3.3.1 SDK Extensions — all optional for backward compatibility
  pluginVersion?: string;
  platformVersion?: string;
  minimumPlatformVersion?: string;
  maximumPlatformVersion?: string;
  peerDependencies?: string[];
  migrationVersion?: number;
  semanticVersion?: string;
}
