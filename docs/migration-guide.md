# Migration Guide

## Overview

The MigrationFramework supports versioned manifest upgrades, configuration migrations, compatibility adapters, and rollback.

## Registering a Migration

```typescript
import { MigrationFramework } from "../sdk/migration-framework";

const framework = new MigrationFramework();

framework.registerMigration({
  fromVersion: 0,
  toVersion: 1,
  description: "Add platformVersion field",
  migrate: (manifest) => ({
    ...manifest,
    platformVersion: "3.3.1",
  }),
});
```

## Running Migrations

```typescript
const updated = framework.migrate(oldManifest, targetVersion);
```

## Rollback

```typescript
const previous = framework.rollback();
```

## Migration History

```typescript
const history = framework.getMigrationHistory();
```

## Best Practices

1. Always register migrations in ascending version order.
2. Each migration should be idempotent.
3. Keep migration steps small and focused.
4. Test rollback behavior before deploying.
