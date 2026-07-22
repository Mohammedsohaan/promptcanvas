import { PluginManifest } from "../services/core/plugin-manifest";

export interface MigrationStep {
  fromVersion: number;
  toVersion: number;
  description: string;
  migrate: (manifest: PluginManifest) => PluginManifest;
}

/**
 * MigrationFramework supports versioned manifest upgrades and configuration
 * migrations with rollback capability.
 */
export class MigrationFramework {
  private steps: MigrationStep[] = [];
  private history: Array<{ manifest: PluginManifest; step: MigrationStep }> = [];

  public registerMigration(step: MigrationStep): void {
    this.steps.push(step);
    this.steps.sort((a, b) => a.fromVersion - b.fromVersion);
  }

  public migrate(manifest: PluginManifest, targetVersion: number): PluginManifest {
    let current = { ...manifest };
    const currentMigrationVersion = current.migrationVersion || 0;

    const applicableSteps = this.steps.filter(
      s => s.fromVersion >= currentMigrationVersion && s.toVersion <= targetVersion
    );

    for (const step of applicableSteps) {
      const before = { ...current };
      current = step.migrate(current);
      current.migrationVersion = step.toVersion;
      this.history.push({ manifest: before, step });
    }

    return current;
  }

  public rollback(): PluginManifest | undefined {
    const last = this.history.pop();
    return last?.manifest;
  }

  public getMigrationHistory(): Array<{ manifest: PluginManifest; step: MigrationStep }> {
    return [...this.history];
  }

  public getAvailableMigrations(): MigrationStep[] {
    return [...this.steps];
  }
}
