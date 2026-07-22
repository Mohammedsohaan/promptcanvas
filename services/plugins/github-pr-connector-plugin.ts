import { ConnectorPlugin } from "./interfaces/connector-plugin";
import { PullRequestConnector } from "../integration/pull-request-connector";
import { GitHubProvider } from "../integration/github-provider";

export class GitHubPullRequestConnectorPlugin implements ConnectorPlugin {
  private connector: PullRequestConnector;
  private connected: boolean = false;

  constructor() {
    this.connector = new PullRequestConnector(new GitHubProvider());
  }

  provider(): string {
    return "GitHubPullRequest";
  }

  async connect(credentials?: Record<string, any>): Promise<void> {
    // In a real implementation this would authenticate Octokit.
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  public getConnector(): PullRequestConnector {
    return this.connector;
  }
}
