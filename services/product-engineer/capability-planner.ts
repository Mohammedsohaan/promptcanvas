import { CapabilityType, IntentType, WorkflowPlan, WorkflowStep } from "./types";

/**
 * CapabilityPlanner maps classified intents into a DAG of executable steps
 * across existing generators, contextual reviewers, and sync engines.
 */
export class CapabilityPlanner {
  public static plan(userPrompt: string, intent: IntentType): WorkflowPlan {
    const prompt = userPrompt.toLowerCase();
    const steps: WorkflowStep[] = [];

    const needsPRD = prompt.includes("prd") || prompt.includes("requirement") || intent === "generation" || intent === "mixed";
    const needsStories = prompt.includes("story") || prompt.includes("stories") || prompt.includes("user story") || intent === "mixed";
    const needsAPI = prompt.includes("api") || prompt.includes("endpoint") || intent === "mixed";
    const needsDB = prompt.includes("db") || prompt.includes("database") || prompt.includes("schema") || intent === "mixed";
    const needsTests = prompt.includes("test") || prompt.includes("test case") || intent === "mixed";
    const needsSprint = prompt.includes("sprint") || prompt.includes("backlog") || intent === "planning" || intent === "mixed";
    const needsRelease = prompt.includes("release") || prompt.includes("readiness") || intent === "review" || intent === "mixed";
    const needsSync = prompt.includes("github") || prompt.includes("jira") || prompt.includes("sync") || intent === "sync";

    let stepIndex = 1;

    if (needsPRD) {
      steps.push({
        id: `step-${stepIndex++}`,
        capability: "generate_prd",
        description: "Generate Business Requirements (PRD)",
        status: "pending",
      });
    }

    if (needsStories) {
      const prevStepId = steps.length > 0 ? steps[steps.length - 1].id : undefined;
      steps.push({
        id: `step-${stepIndex++}`,
        capability: "generate_stories",
        description: "Generate User Stories",
        status: "pending",
        dependsOn: prevStepId ? [prevStepId] : undefined,
      });
    }

    if (needsAPI) {
      const prevStepId = steps.length > 0 ? steps[steps.length - 1].id : undefined;
      steps.push({
        id: `step-${stepIndex++}`,
        capability: "generate_api",
        description: "Generate API Specification",
        status: "pending",
        dependsOn: prevStepId ? [prevStepId] : undefined,
      });
    }

    if (needsDB) {
      const prevStepId = steps.length > 0 ? steps[steps.length - 1].id : undefined;
      steps.push({
        id: `step-${stepIndex++}`,
        capability: "generate_schema",
        description: "Generate Database Schema",
        status: "pending",
        dependsOn: prevStepId ? [prevStepId] : undefined,
      });
    }

    if (needsTests) {
      const prevStepId = steps.length > 0 ? steps[steps.length - 1].id : undefined;
      steps.push({
        id: `step-${stepIndex++}`,
        capability: "generate_test_cases",
        description: "Generate AI Test Cases",
        status: "pending",
        dependsOn: prevStepId ? [prevStepId] : undefined,
      });
    }

    if (needsSprint) {
      const prevStepId = steps.length > 0 ? steps[steps.length - 1].id : undefined;
      steps.push({
        id: `step-${stepIndex++}`,
        capability: "generate_sprint",
        description: "Plan AI Sprint Backlog",
        status: "pending",
        dependsOn: prevStepId ? [prevStepId] : undefined,
      });
    }

    if (needsRelease) {
      const prevStepId = steps.length > 0 ? steps[steps.length - 1].id : undefined;
      steps.push({
        id: `step-${stepIndex++}`,
        capability: "check_release",
        description: "Evaluate Release Readiness",
        status: "pending",
        dependsOn: prevStepId ? [prevStepId] : undefined,
      });
    }

    if (needsSync) {
      const prevStepId = steps.length > 0 ? steps[steps.length - 1].id : undefined;
      steps.push({
        id: `step-${stepIndex++}`,
        capability: "sync_engineering",
        description: "Publish & Sync to Engineering Platforms (GitHub/Jira)",
        status: "pending",
        dependsOn: prevStepId ? [prevStepId] : undefined,
      });
    }

    // Fallback if no specific prompt matches
    if (steps.length === 0) {
      steps.push({
        id: `step-${stepIndex++}`,
        capability: "check_consistency",
        description: "Execute Comprehensive Consistency Review",
        status: "pending",
      });
    }

    return {
      id: `plan-${Date.now()}`,
      intent,
      summary: `Automated ${intent.toUpperCase()} Workflow (${steps.length} capabilities)`,
      steps,
      status: "idle",
      createdAt: new Date().toISOString(),
    };
  }
}
