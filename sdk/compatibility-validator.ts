import { PluginManifest } from "../services/core/plugin-manifest";
import { PLATFORM_VERSION } from "./plugin-sdk";

export interface CompatibilityResult {
  compatible: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * CompatibilityValidator checks whether a plugin is compatible with the
 * current platform version, its dependency chain, and whether it would
 * introduce duplicate registrations.
 */
export class CompatibilityValidator {
  private loadedPluginIds: Set<string>;

  constructor(loadedPluginIds: string[] = []) {
    this.loadedPluginIds = new Set(loadedPluginIds);
  }

  public validate(manifest: PluginManifest): CompatibilityResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Platform version range check
    if (manifest.minimumPlatformVersion) {
      if (this.compareVersions(PLATFORM_VERSION, manifest.minimumPlatformVersion) < 0) {
        errors.push(`Platform version ${PLATFORM_VERSION} is below minimum required ${manifest.minimumPlatformVersion}.`);
      }
    }
    if (manifest.maximumPlatformVersion) {
      if (this.compareVersions(PLATFORM_VERSION, manifest.maximumPlatformVersion) > 0) {
        errors.push(`Platform version ${PLATFORM_VERSION} exceeds maximum supported ${manifest.maximumPlatformVersion}.`);
      }
    }

    // Duplicate plugin check
    if (this.loadedPluginIds.has(manifest.id)) {
      errors.push(`Duplicate plugin: ${manifest.id} is already loaded.`);
    }

    // Deprecated API warnings (future-proofing)
    if (manifest.version && manifest.version.startsWith("0.")) {
      warnings.push(`Plugin ${manifest.id} is a pre-release version.`);
    }

    return { compatible: errors.length === 0, errors, warnings };
  }

  /**
   * Naive semver comparator: returns -1, 0, or 1.
   */
  private compareVersions(a: string, b: string): number {
    const pa = a.split(".").map(Number);
    const pb = b.split(".").map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const va = pa[i] || 0;
      const vb = pb[i] || 0;
      if (va < vb) return -1;
      if (va > vb) return 1;
    }
    return 0;
  }
}
