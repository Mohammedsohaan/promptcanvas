import { IntentPlanner } from "../product-engineer/intent-planner";
import { CapabilityPlanner } from "../product-engineer/capability-planner";
import { WorkflowEngine } from "../product-engineer/workflow-engine";
import { ProductEngineerService } from "../product-engineer/product-engineer";

describe("ProductEngineerService & Workflow Architecture", () => {
  it("should classify prompt intents accurately", () => {
    expect(IntentPlanner.classify("Generate PRD and user stories")).toBe("mixed");
    expect(IntentPlanner.classify("Review architecture scalability")).toBe("review");
    expect(IntentPlanner.classify("Plan sprint backlog for sprint 1")).toBe("planning");
    expect(IntentPlanner.classify("Sync issues to github")).toBe("sync");
    expect(IntentPlanner.classify("Check code drift in repository")).toBe("repository_analysis");
  });

  it("should plan multi-step capabilities with dependencies", () => {
    const plan = CapabilityPlanner.plan("Build auth module with user stories and test cases", "mixed");

    expect(plan.steps.length).toBeGreaterThan(1);
    expect(plan.steps[0].capability).toBe("generate_prd");
    expect(plan.steps[1].dependsOn).toContain(plan.steps[0].id);
  });

  it("should execute workflow plan through WorkflowEngine and update state", async () => {
    const plan = CapabilityPlanner.plan("Review consistency", "review");
    const engine = new WorkflowEngine(plan);

    const result = await engine.executeWorkflow();

    expect(result.status).toBe("completed");
    expect(result.steps.every((s) => s.status === "completed")).toBe(true);
  });

  it("should run full ProductEngineerService request stream and return plan", async () => {
    const plan = await ProductEngineerService.planWorkflow("Build user story and API specs");
    expect(plan.steps.length).toBeGreaterThan(0);
  });
});
