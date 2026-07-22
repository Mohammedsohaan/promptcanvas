import { CapabilityPlugin } from "./interfaces/capability-plugin";
import { WorkflowPlugin } from "./interfaces/workflow-plugin";
import { AnalysisPlugin } from "./interfaces/analysis-plugin";
import { PipelineContextOrchestrator } from "../analysis/pipeline-context-orchestrator";

export class PipelineCapabilityPlugin implements CapabilityPlugin {
  id = "analyze_pipeline";
  name = "AI CI/CD Pipeline Intelligence";
  version = "1.0.0";

  register(): void {}

  async execute(context: Record<string, any>): Promise<any> {
    return { status: "success", capability: this.id };
  }
}

export class PipelineWorkflowPlugin implements WorkflowPlugin {
  workflowId = "workflow_pipeline_intelligence";
  steps = [];
  outputs = [];

  async execute(context: Record<string, any>): Promise<any> {
    return { workflowId: this.workflowId, status: "completed" };
  }
}

export class PipelineAnalysisPlugin implements AnalysisPlugin {
  private orchestrator = new PipelineContextOrchestrator();

  supports(context: Record<string, any>): boolean {
    return context.type === "pipeline";
  }

  priority(): number {
    return 100;
  }

  async analyze(context: Record<string, any>): Promise<any> {
    return await this.orchestrator.orchestrate(context.pipeline, context.prContext);
  }
}
