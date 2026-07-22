import { PluginManifest } from "../services/core/plugin-manifest";

/**
 * Returns a minimal, valid PluginManifest template for new plugin scaffolding.
 */
export function createPluginTemplate(id: string, name: string): PluginManifest {
  return {
    id,
    name,
    version: "0.1.0",
    description: `${name} plugin for PromptCanvas platform.`,
    author: "",
    dependencies: [],
    peerDependencies: [],
    minimumPlatformVersion: "3.3.1",
    platformVersion: "3.3.1",
    pluginVersion: "0.1.0",
    semanticVersion: "0.1.0",
    migrationVersion: 1,
    status: "uninitialized"
  };
}
