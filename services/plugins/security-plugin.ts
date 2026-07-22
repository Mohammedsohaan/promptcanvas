import { CapabilityPlugin } from "./interfaces/capability-plugin";
import { WorkflowPlugin } from "./interfaces/workflow-plugin";
import { AnalysisPlugin } from "./interfaces/analysis-plugin";
import { SecurityContextOrchestrator } from "../analysis/security-context-orchestrator";

export class SecurityCapabilityPlugin implements CapabilityPlugin {
  id = "analyze_security";
  name = "AI Security Intelligence";
  version = "1.0.0";
  register(): void {}
  async execute(context: Record<string, any>): Promise<any> {
    return { status: "success", capability: this.id };
  }
}

export class SecurityWorkflowPlugin implements WorkflowPlugin {
  workflowId = "workflow_security_intelligence";
  steps = [];
  outputs = [];
  async execute(context: Record<string, any>): Promise<any> {
    return { workflowId: this.workflowId, status: "completed" };
  }
}

export class SecurityAnalysisPlugin implements AnalysisPlugin {
  private orchestrator = new SecurityContextOrchestrator();

  supports(context: Record<string, any>): boolean {
    return context.type === "security";
  }
  priority(): number { return 110; }
  async analyze(context: Record<string, any>): Promise<any> {
    return await this.orchestrator.orchestrate(context.security, context.runtimeContext, context.pipelineContext);
  }
}
