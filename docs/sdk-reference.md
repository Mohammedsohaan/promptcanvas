# SDK Reference

## PluginSDK

```typescript
new PluginSDK(manifest, lifecycle?)
```

| Method                 | Returns            | Description                    |
| ---------------------- | ------------------ | ------------------------------ |
| `getManifest()`        | `PluginManifest`   | Returns a copy of the manifest |
| `getPlatformVersion()` | `string`           | Current platform version       |
| `getPluginId()`        | `string`           | Plugin identifier              |
| `getStatus()`          | `PluginStatus`     | Current lifecycle status       |
| `install()`            | `Promise<void>`    | Installs the plugin            |
| `initialize()`         | `Promise<void>`    | Initializes the plugin         |
| `validate()`           | `Promise<boolean>` | Validates compatibility        |
| `start()`              | `Promise<void>`    | Starts the plugin              |
| `stop()`               | `Promise<void>`    | Stops the plugin               |
| `shutdown()`           | `Promise<void>`    | Shuts down the plugin          |

## PluginBuilder

Fluent API for constructing plugins:

```typescript
new PluginBuilder()
  .setId("id").setName("name").setVersion("1.0.0")
  .addDependency("dep")
  .onStart(async () => { ... })
  .build();
```

## PluginValidator

```typescript
new PluginValidator().validate(manifest); // ValidationResult
```

## CompatibilityValidator

```typescript
new CompatibilityValidator(loadedIds).validate(manifest); // CompatibilityResult
```

## DependencyValidator

```typescript
new DependencyValidator(manifests).validate(); // DependencyValidationResult
```

## MigrationFramework

```typescript
const mf = new MigrationFramework();
mf.registerMigration({
  fromVersion: 0,
  toVersion: 1,
  description: "...",
  migrate: fn,
});
mf.migrate(manifest, 1);
mf.rollback();
```

## PlatformCache

```typescript
PlatformCache.getInstance().set("key", value, ttlMs);
PlatformCache.getInstance().get("key");
PlatformCache.getInstance().statistics();
```

## PlatformTelemetryService

```typescript
PlatformTelemetryService.getInstance().measure("op", () => { ... });
PlatformTelemetryService.getInstance().summary();
```

## ProfilerService

```typescript
ProfilerService.getInstance().startTimer("label");
ProfilerService.getInstance().stopTimer("label");
ProfilerService.getInstance().generateBenchmark();
```

## PlatformHealthService

```typescript
PlatformHealthService.getInstance().evaluate(); // PlatformHealthReport
```
