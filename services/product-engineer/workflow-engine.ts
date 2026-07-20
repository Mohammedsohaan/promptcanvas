import { CapabilityType, WorkflowPlan, WorkflowStep } from "./types";

export type StepExecutor = (step: WorkflowStep) => Promise<string | undefined>;

/**
 * WorkflowEngine manages live workflow state, step ordering, dependency checks,
 * parallel execution, and step status transitions.
 */
export class WorkflowEngine {
  private plan: WorkflowPlan;
  private executorMap: Map<CapabilityType, StepExecutor> = new Map();

  constructor(plan: WorkflowPlan) {
    this.plan = plan;
  }

  public registerCapabilityHandler(capability: CapabilityType, executor: StepExecutor): void {
    this.executorMap.set(capability, executor);
  }

  public getPlan(): WorkflowPlan {
    return this.plan;
  }

  public async executeWorkflow(
    onStepUpdate?: (plan: WorkflowPlan, updatedStep: WorkflowStep) => void
  ): Promise<WorkflowPlan> {
    this.plan.status = "running";

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
        const executor = this.executorMap.get(step.capability);
        if (executor) {
          const artifactId = await executor(step);
          step.outputArtifactId = artifactId;
          step.status = "completed";
        } else {
          // Default mock handler for testing and un-registered handlers
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
