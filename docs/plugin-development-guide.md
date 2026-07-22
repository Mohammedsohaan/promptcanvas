# Plugin Development Guide

## Quick Start

```typescript
import { PluginBuilder } from "../sdk/plugin-builder";

const myPlugin = new PluginBuilder()
  .setId("my-custom-plugin")
  .setName("My Custom Plugin")
  .setVersion("1.0.0")
  .setAuthor("Your Name")
  .addDependency("core-services")
  .setMinimumPlatformVersion("3.3.1")
  .onInitialize(async () => console.log("Plugin initialized"))
  .onStart(async () => console.log("Plugin started"))
  .build();
```

## Plugin Lifecycle

Every plugin passes through these lifecycle stages:

1. **install()** — Plugin is downloaded and placed in the plugin directory.
2. **initialize()** — Plugin performs its internal setup.
3. **validate()** — Plugin checks compatibility with the current platform.
4. **start()** — Plugin begins active operation.
5. **stop()** — Plugin pauses operation but retains state.
6. **shutdown()** — Plugin is completely torn down.

## Plugin Types

| Type       | Interface          | Registry             |
| ---------- | ------------------ | -------------------- |
| Capability | `CapabilityPlugin` | `CapabilityRegistry` |
| Workflow   | `WorkflowPlugin`   | `WorkflowRegistry`   |
| Analysis   | `AnalysisPlugin`   | `AnalysisRegistry`   |
| Generator  | `GeneratorPlugin`  | `GeneratorRegistry`  |
| Connector  | `ConnectorPlugin`  | `ConnectorRegistry`  |

## Manifest

Every plugin has a `PluginManifest` with:

- `id` — Unique identifier
- `name` — Human-readable name
- `version` — Semantic version
- `dependencies` — Array of required plugin IDs
- `minimumPlatformVersion` — Minimum compatible platform version

## Validation

Use `PluginValidator` to validate manifests before loading:

```typescript
import { PluginValidator } from "../sdk/plugin-validator";
const result = new PluginValidator().validate(manifest);
```

## Compatibility

Use `CompatibilityValidator` to check platform version ranges:

```typescript
import { CompatibilityValidator } from "../sdk/compatibility-validator";
const result = new CompatibilityValidator(loadedIds).validate(manifest);
```

## CLI Commands

- `generate plugin` — Scaffold a new plugin template
- `validate plugin` — Validate a plugin manifest
- `test plugin` — Run plugin tests
- `build plugin` — Build plugin for distribution
- `publish plugin` — Publish plugin to registry
