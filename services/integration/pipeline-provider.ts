import { PipelineModel } from "../../types/pipeline";

export interface PipelineProvider {
  name(): string;
  fetchPipelineRun(repoId: string, runId: string, credentials?: Record<string, any>): Promise<PipelineModel>;
}
