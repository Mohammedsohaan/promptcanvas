import { ServiceModel } from "./service";
import { MetricModel } from "./metrics";
import { LogModel } from "./logs";
import { TraceModel } from "./traces";
import { AlertModel } from "./alerts";
import { IncidentModel } from "./incident";
import { ServiceTopology } from "./service-topology";
import { EnvironmentModel } from "./environment";
import { DeploymentModel } from "./deployment";

export interface RuntimeHistoryMetric {
  timestamp: string;
  status: string;
  errorRate: number;
}

export interface RuntimeModel {
  id: string; // The environment or cluster identifier
  provider: string; // e.g., OpenTelemetry
  services: ServiceModel[];
  deployments: DeploymentModel[];
  metrics: MetricModel;
  logs: LogModel[];
  traces: TraceModel[];
  alerts: AlertModel[];
  incidents: IncidentModel[];
  serviceTopology: ServiceTopology;
  environment: EnvironmentModel;
  history: RuntimeHistoryMetric[];
}
