import { ProjectId } from "@/types/document";
import { CopilotMode, StreamingChunk } from "@/types/ai";
import { IntentPlanner } from "./intent-planner";
import { CapabilityPlanner } from "./capability-planner";
import { WorkflowRegistry } from "../core/workflow-registry";
import { WorkflowEngine } from "./workflow-engine";
import { WorkflowPlan } from "./types";
import { copilotEngine } from "../copilot-engine";

export interface ProductEngineerRequest {
  projectId: ProjectId;
  prompt: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  signal?: AbortSignal;
}

/**
 * ProductEngineerService serves as the autonomous AI Product Engineer interface.
 * Refactored in v3.0.1 to act as a pure orchestrator utilizing plugin registries.
 */
export class ProductEngineerService {
  public static async planWorkflow(userPrompt: string): Promise<WorkflowPlan> {
    const intent = IntentPlanner.classify(userPrompt);
    // Backward compatibility wrapper which now routes via IntentResolver
    return CapabilityPlanner.plan(userPrompt, intent);
  }

  public static async *executeEngineerRequest(
    request: ProductEngineerRequest,
    onPlanCreated?: (plan: WorkflowPlan) => void
  ): AsyncGenerator<StreamingChunk, WorkflowPlan, unknown> {
    const { projectId, prompt, history = [], signal } = request;

    // 1. Plan workflow from prompt
    const plan = await this.planWorkflow(prompt);
    if (onPlanCreated) {
      onPlanCreated(plan);
    }

    // 2. Discover and execute workflow dynamically
    // In full plugin architecture, we'd lookup the workflow in WorkflowRegistry by plan intent.
    // For backward compatibility, we execute the plan via our default WorkflowEngine which 
    // itself discovers capability steps via the CapabilityRegistry.
    const engine = new WorkflowEngine(plan);
    await engine.executeWorkflow();

    // 3. Map intent to equivalent CopilotMode for contextual streaming response
    let copilotMode: CopilotMode = CopilotMode.GENERAL;
    if (plan.intent === "review") copilotMode = CopilotMode.REVIEWER;
    else if (plan.intent === "planning") copilotMode = CopilotMode.RELEASE;
    else if (plan.intent === "repository_analysis") copilotMode = CopilotMode.IMPLEMENTATION;

    // 4. Delegate to CopilotEngine for streaming response
    const stream = copilotEngine.streamConversation({
      projectId,
      question: prompt,
      mode: copilotMode,
      history,
      signal,
    });

    for await (const chunk of stream) {
      yield chunk;
    }

    return plan;
  }
}
