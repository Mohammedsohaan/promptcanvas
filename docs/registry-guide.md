# Registry Guide

## Overview

PromptCanvas uses five specialized registries to manage plugin discovery and resolution at runtime.

## Registry Types

### CapabilityRegistry

Manages capability plugins that expose discrete actions.

```typescript
CapabilityRegistry.getInstance().register(plugin);
CapabilityRegistry.getInstance().resolve("plugin_id");
CapabilityRegistry.getInstance().exists("plugin_id");
```

### WorkflowRegistry

Manages multi-step workflow plugins.

### AnalysisRegistry

Manages analysis plugins with `supports()` and `priority()`.

### GeneratorRegistry

Manages document generation plugins.

### ConnectorRegistry

Manages external system connectors (GitHub, OpenTelemetry, etc.).

## Diagnostics (v3.3.1)

Every registry now exposes diagnostic methods:

```typescript
registry.health(); // { status: "healthy" | "degraded", issues: [] }
registry.statistics(); // { totalPlugins: N, registeredIds: [...] }
registry.diagnostics(); // { health, status, statistics }
```

## Validation

Each registry tracks validation errors internally:

```typescript
registry.validate(); // true if no errors
registry.getStatus(); // Full RegistryStatus object
```
