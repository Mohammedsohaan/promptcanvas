import { ConnectorPlugin } from "./interfaces/connector-plugin";
import { PipelineConnector } from "../integration/pipeline-connector";
import { GitHubActionsProvider } from "../integration/github-actions-provider";

export class GitHubActionsConnectorPlugin implements ConnectorPlugin {
  private connector: PipelineConnector;
  private connected: boolean = false;

  constructor() {
    this.connector = new PipelineConnector(new GitHubActionsProvider());
  }

  provider(): string {
    return "GitHubActions";
  }

  async connect(credentials?: Record<string, any>): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  public getConnector(): PipelineConnector {
    return this.connector;
  }
}
