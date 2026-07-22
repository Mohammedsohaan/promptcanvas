# PromptCanvas Architecture Guide

## Platform Overview

PromptCanvas is an AI-powered Product Engineering platform built on a modular, plugin-driven architecture. The platform follows a strict principle: **AI explains; Deterministic services compute.**

## Architecture Layers

### Layer 1: Plugin Architecture Foundation (v3.0.1)

The core infrastructure consists of five registries, a bootstrap manager, and an event bus:

- **CapabilityRegistry** — Maps plugin IDs to executable capability plugins.
- **WorkflowRegistry** — Maps workflow IDs to step-based workflow plugins.
- **AnalysisRegistry** — Maps analysis contexts to analysis plugins.
- **GeneratorRegistry** — Maps generator IDs to document generators.
- **ConnectorRegistry** — Maps provider names to external integration connectors.
- **PlatformEventBus** — Pub/sub event system for decoupled communication.
- **BootstrapManager** — Orchestrates startup, plugin loading, and dependency validation.
- **PluginLoader** — Discovers and registers plugins into registries.

### Layer 2: Intelligence Modules

Each intelligence domain is a self-contained plugin suite that registers through the Plugin Architecture:

| Version | Module               | Provider              | Models                             |
| ------- | -------------------- | --------------------- | ---------------------------------- |
| v3.1    | PR Intelligence      | GitHubProvider        | RepositoryDiff, PullRequestContext |
| v3.2    | CI/CD Intelligence   | GitHubActionsProvider | PipelineModel, PipelineContext     |
| v3.3    | Runtime Intelligence | OpenTelemetryProvider | RuntimeModel, RuntimeContext       |

### Layer 3: Stabilization (v3.3.1)

- **Plugin SDK** — Stable lifecycle API for third-party plugin development.
- **PlatformCache** — Memory-backed caching with TTL and distributed cache interface.
- **PlatformTelemetry** — Internal operation measurement.
- **ProfilerService** — Bootstrap and memory benchmarking.
- **PlatformHealthService** — Unified health aggregation across subsystems.
- **MigrationFramework** — Versioned manifest upgrades with rollback.

## Data Flow

```
Provider → Connector → Domain Model → Analysis Services → Context → PromptBuilder → AI
```

The AI never computes metrics. Every number presented to the AI has been deterministically computed by a service.

## Event Lifecycle

Events flow through PlatformEventBus at every pipeline stage. Each intelligence module publishes events at:

1. Data fetched from provider
2. Each analysis stage completed
3. Context aggregated
4. AI review generated

## Plugin Contract

Every plugin must:

1. Implement one of the plugin interfaces (Capability, Workflow, Analysis, Connector).
2. Register through BootstrapManager.
3. Publish lifecycle events through PlatformEventBus.
4. Never modify ProductEngineer directly.
