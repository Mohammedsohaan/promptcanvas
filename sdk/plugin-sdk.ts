import { PluginManifest, PluginStatus } from "../services/core/plugin-manifest";

/**
 * PluginSDK provides a stable public API surface for third-party and internal
 * plugin authors. It codifies the plugin lifecycle and exposes safe accessors
 * to the platform's registries without leaking internals.
 */
export interface PluginLifecycle {
  install(): Promise<void>;
  initialize(): Promise<void>;
  validate(): Promise<boolean>;
  start(): Promise<void>;
  stop(): Promise<void>;
  shutdown(): Promise<void>;
}

export const PLATFORM_VERSION = "3.3.1";

export class PluginSDK {
  private manifest: PluginManifest;
  private lifecycle: Partial<PluginLifecycle>;

  constructor(manifest: PluginManifest, lifecycle?: Partial<PluginLifecycle>) {
    this.manifest = {
      ...manifest,
      platformVersion: PLATFORM_VERSION,
      pluginVersion: manifest.version,
      semanticVersion: manifest.version,
    };
    this.lifecycle = lifecycle || {};
  }

  public getManifest(): PluginManifest {
    return { ...this.manifest };
  }

  public getPlatformVersion(): string {
    return PLATFORM_VERSION;
  }

  public getPluginId(): string {
    return this.manifest.id;
  }

  public getStatus(): PluginStatus {
    return this.manifest.status;
  }

  public async install(): Promise<void> {
    if (this.lifecycle.install) await this.lifecycle.install();
    this.manifest.status = "uninitialized";
  }

  public async initialize(): Promise<void> {
    if (this.lifecycle.initialize) await this.lifecycle.initialize();
  }

  public async validate(): Promise<boolean> {
    if (this.lifecycle.validate) return this.lifecycle.validate();
    return true;
  }

  public async start(): Promise<void> {
    if (this.lifecycle.start) await this.lifecycle.start();
    this.manifest.status = "loaded";
  }

  public async stop(): Promise<void> {
    if (this.lifecycle.stop) await this.lifecycle.stop();
    this.manifest.status = "stopped";
  }

  public async shutdown(): Promise<void> {
    if (this.lifecycle.shutdown) await this.lifecycle.shutdown();
    this.manifest.status = "stopped";
  }
}
