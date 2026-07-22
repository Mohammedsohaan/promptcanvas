import { PipelineProvider } from "./pipeline-provider";
import { PipelineModel } from "../../types/pipeline";
import { PlatformEventBus } from "../core/platform-event-bus";

/**
 * PipelineConnector normalizes provider output into PipelineModel
 * and manages integration event lifecycles.
 */
export class PipelineConnector {
  constructor(private provider: PipelineProvider) {}

  public async getPipeline(repoId: string, runId: string, credentials?: Record<string, any>): Promise<PipelineModel> {
    PlatformEventBus.getInstance().publish("PipelineStarted", { provider: this.provider.name(), repoId, runId });
    
    const pipeline = await this.provider.fetchPipelineRun(repoId, runId, credentials);
    
    PlatformEventBus.getInstance().publish("PipelineFetched", { 
      provider: this.provider.name(), 
      repoId, 
      runId, 
      pipeline 
    });

    return pipeline;
  }
}
