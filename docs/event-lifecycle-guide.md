# Event Lifecycle Guide

## Overview

PlatformEventBus is the decoupled communication backbone. Every intelligence module publishes events at each pipeline stage.

## Platform Events

| Event                 | Source           |
| --------------------- | ---------------- |
| `PlatformStarted`     | BootstrapManager |
| `RegistryInitialized` | BootstrapManager |
| `PluginLoaded`        | PluginLoader     |
| `BootstrapCompleted`  | BootstrapManager |
| `PlatformReady`       | BootstrapManager |

## PR Intelligence Events

`RepositoryDiffCreated` → `DiffAnalysisCompleted` → `ImpactAnalysisCompleted` → `MergeReadinessComputed` → `ReviewRecommendationGenerated` → `PullRequestContextCreated`

## CI/CD Intelligence Events

`PipelineStarted` → `PipelineFetched` → `PipelineAnalyzed` → `QualityGateEvaluated` → `ArtifactAnalysisCompleted` → `DeploymentRiskComputed` → `ReleaseValidated` → `PipelineRecommendationGenerated` → `PipelineContextCreated`

## Runtime Intelligence Events

`RuntimeConnected` → `MetricsCollected` → `LogsCollected` → `TracesCollected` → `HealthAnalyzed` → `IncidentAnalyzed` → `PerformanceAnalyzed` → `CapacityAnalyzed` → `DependencyAnalyzed` → `ObservabilityAnalyzed` → `RuntimeRecommendationGenerated` → `RuntimeContextCreated`

## Subscribing

```typescript
PlatformEventBus.getInstance().subscribe("PipelineAnalyzed", (data) => {
  console.log("Pipeline analyzed:", data);
});
```
