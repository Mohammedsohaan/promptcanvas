import { PluginManifest } from "../services/core/plugin-manifest";
import { PluginSDK, PluginLifecycle, PLATFORM_VERSION } from "./plugin-sdk";

/**
 * PluginBuilder provides a fluent API for constructing plugins with
 * validated manifests and lifecycle hooks.
 */
export class PluginBuilder {
  private id: string = "";
  private name: string = "";
  private version: string = "0.0.1";
  private description: string = "";
  private author: string = "";
  private dependencies: string[] = [];
  private peerDependencies: string[] = [];
  private minimumPlatformVersion: string = "3.0.1";
  private lifecycle: Partial<PluginLifecycle> = {};

  public setId(id: string): PluginBuilder {
    this.id = id;
    return this;
  }

  public setName(name: string): PluginBuilder {
    this.name = name;
    return this;
  }

  public setVersion(version: string): PluginBuilder {
    this.version = version;
    return this;
  }

  public setDescription(description: string): PluginBuilder {
    this.description = description;
    return this;
  }

  public setAuthor(author: string): PluginBuilder {
    this.author = author;
    return this;
  }

  public addDependency(dep: string): PluginBuilder {
    this.dependencies.push(dep);
    return this;
  }

  public addPeerDependency(dep: string): PluginBuilder {
    this.peerDependencies.push(dep);
    return this;
  }

  public setMinimumPlatformVersion(v: string): PluginBuilder {
    this.minimumPlatformVersion = v;
    return this;
  }

  public onInstall(fn: () => Promise<void>): PluginBuilder {
    this.lifecycle.install = fn;
    return this;
  }

  public onInitialize(fn: () => Promise<void>): PluginBuilder {
    this.lifecycle.initialize = fn;
    return this;
  }

  public onStart(fn: () => Promise<void>): PluginBuilder {
    this.lifecycle.start = fn;
    return this;
  }

  public onStop(fn: () => Promise<void>): PluginBuilder {
    this.lifecycle.stop = fn;
    return this;
  }

  public onShutdown(fn: () => Promise<void>): PluginBuilder {
    this.lifecycle.shutdown = fn;
    return this;
  }

  public build(): PluginSDK {
    if (!this.id || !this.name) {
      throw new Error("PluginBuilder: id and name are required.");
    }

    const manifest: PluginManifest = {
      id: this.id,
      name: this.name,
      version: this.version,
      description: this.description,
      author: this.author,
      dependencies: this.dependencies,
      peerDependencies: this.peerDependencies,
      minimumPlatformVersion: this.minimumPlatformVersion,
      platformVersion: PLATFORM_VERSION,
      pluginVersion: this.version,
      semanticVersion: this.version,
      status: "uninitialized"
    };

    return new PluginSDK(manifest, this.lifecycle);
  }
}
