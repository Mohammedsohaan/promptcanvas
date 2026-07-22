import { PluginManifest } from "../services/core/plugin-manifest";
import { PLATFORM_VERSION } from "./plugin-sdk";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * PluginValidator performs static validation of a PluginManifest
 * before it enters the registry system.
 */
export class PluginValidator {
  public validate(manifest: PluginManifest): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!manifest.id) errors.push("Plugin id is required.");
    if (!manifest.name) errors.push("Plugin name is required.");
    if (!manifest.version) errors.push("Plugin version is required.");

    // Check for deprecated APIs (placeholder for future policies)
    if (manifest.pluginVersion && manifest.pluginVersion.startsWith("0.")) {
      warnings.push("Pre-release plugin version detected.");
    }

    return { valid: errors.length === 0, errors, warnings };
  }
}
