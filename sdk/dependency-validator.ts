import { PluginManifest } from "../services/core/plugin-manifest";

export interface DependencyValidationResult {
  valid: boolean;
  missingDependencies: string[];
  circularDependencies: string[];
  versionConflicts: string[];
  loadOrder: string[];
}

/**
 * DependencyValidator computes the complete dependency graph for a set
 * of plugins and ensures they can be loaded safely.
 */
export class DependencyValidator {
  private manifests: Map<string, PluginManifest>;

  constructor(manifests: PluginManifest[]) {
    this.manifests = new Map(manifests.map(m => [m.id, m]));
  }

  public validate(): DependencyValidationResult {
    const missingDependencies: string[] = [];
    const circularDependencies: string[] = [];
    const versionConflicts: string[] = [];

    // Check for missing dependencies
    for (const [id, manifest] of this.manifests.entries()) {
      for (const dep of manifest.dependencies) {
        if (!this.manifests.has(dep)) {
          missingDependencies.push(`${id} requires ${dep}`);
        }
      }
    }

    // Check for circular dependencies via DFS
    const visited = new Set<string>();
    const inStack = new Set<string>();

    const dfs = (id: string): boolean => {
      if (inStack.has(id)) {
        circularDependencies.push(id);
        return true;
      }
      if (visited.has(id)) return false;
      visited.add(id);
      inStack.add(id);
      const manifest = this.manifests.get(id);
      if (manifest) {
        for (const dep of manifest.dependencies) {
          if (this.manifests.has(dep) && dfs(dep)) return true;
        }
      }
      inStack.delete(id);
      return false;
    };

    for (const id of this.manifests.keys()) {
      visited.clear();
      inStack.clear();
      dfs(id);
    }

    // Compute topological load order
    const loadOrder = this.topologicalSort();

    return {
      valid: missingDependencies.length === 0 && circularDependencies.length === 0,
      missingDependencies,
      circularDependencies,
      versionConflicts,
      loadOrder
    };
  }

  private topologicalSort(): string[] {
    const order: string[] = [];
    const visited = new Set<string>();

    const visit = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);
      const manifest = this.manifests.get(id);
      if (manifest) {
        for (const dep of manifest.dependencies) {
          if (this.manifests.has(dep)) visit(dep);
        }
      }
      order.push(id);
    };

    for (const id of this.manifests.keys()) {
      visit(id);
    }
    return order;
  }
}
