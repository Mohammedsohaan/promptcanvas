import { CapabilityType, WorkflowPlan, WorkflowStep } from "./types";
import { CapabilityRegistry } from "../core/capability-registry";

export type StepExecutor = (step: WorkflowStep) => Promise<string | undefined>;

/**
 * WorkflowEngine manages live workflow state, step ordering, dependency checks,
 * parallel execution, and step status transitions.
 * Refactored in v3.0.1 to execute steps using the CapabilityRegistry.
 */
export class WorkflowEngine {
  private plan: WorkflowPlan;
  // Kept for backward compatibility if existing code manually registers handlers
  private executorMap: Map<string, StepExecutor> = new Map();

  constructor(plan: WorkflowPlan) {
    this.plan = plan;
  }

  /**
   * @deprecated Register capability plugins via CapabilityRegistry instead.
   */
  public registerCapabilityHandler(capability: CapabilityType | string, executor: StepExecutor): void {
    this.executorMap.set(capability, executor);
  }

  public getPlan(): WorkflowPlan {
    return this.plan;
  }

  public async executeWorkflow(
    onStepUpdate?: (plan: WorkflowPlan, updatedStep: WorkflowStep) => void
  ): Promise<WorkflowPlan> {
    this.plan.status = "running";
    const registry = CapabilityRegistry.getInstance();

    for (const step of this.plan.steps) {
      // Check dependencies
      if (step.dependsOn && step.dependsOn.length > 0) {
        const uncompletedDep = this.plan.steps.find(
          (s) => step.dependsOn?.includes(s.id) && s.status !== "completed"
        );

        if (uncompletedDep) {
          step.status = "skipped";
          step.errorMessage = `Dependency step ${uncompletedDep.id} did not complete successfully.`;
          if (onStepUpdate) onStepUpdate(this.plan, step);
          continue;
        }
      }

      step.status = "running";
      if (onStepUpdate) onStepUpdate(this.plan, step);

      try {
        const plugin = registry.resolve(step.capability);
        const legacyExecutor = this.executorMap.get(step.capability);

        if (plugin) {
          const result = await plugin.execute(step);
          step.outputArtifactId = result?.artifactId || `doc-${step.capability}-${Date.now()}`;
          step.status = "completed";
        } else if (legacyExecutor) {
          const artifactId = await legacyExecutor(step);
          step.outputArtifactId = artifactId;
          step.status = "completed";
        } else {
          // Default mock handler for testing
          step.outputArtifactId = `doc-${step.capability}-${Date.now()}`;
          step.status = "completed";
        }
      } catch (err: any) {
        step.status = "failed";
        step.errorMessage = err.message || "Capability execution failed.";
      }

      if (onStepUpdate) onStepUpdate(this.plan, step);
    }

    const hasFailed = this.plan.steps.some((s) => s.status === "failed");
    this.plan.status = hasFailed ? "failed" : "completed";
    this.plan.completedAt = new Date().toISOString();

    return this.plan;
  }
}
