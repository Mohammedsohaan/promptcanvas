import { PipelineStage } from "./pipeline-stage";
import { ArtifactModel } from "./artifact";
import { DeploymentModel } from "./deployment";
import { EnvironmentModel } from "./environment";

export interface PipelineHistoryMetric {
  runId: string;
  status: string;
  duration: number;
  date: string;
}

export interface PipelineModel {
  id: string;
  provider: string;
  workflow: string;
  trigger: string;
  status: "pending" | "running" | "success" | "failed" | "cancelled";
  branch: string;
  commit: string;
  duration: number;
  queueTime: number;
  stages: PipelineStage[];
  artifacts: ArtifactModel[];
  deployments: DeploymentModel[];
  environment?: EnvironmentModel;
  history: PipelineHistoryMetric[];
}
