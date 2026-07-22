import { ConnectorPlugin } from "./interfaces/connector-plugin";
import { SecurityConnector } from "../integration/security-connector";
import { GitHubSecurityProvider } from "../integration/github-security-provider";

export class GitHubSecurityConnectorPlugin implements ConnectorPlugin {
  private connector: SecurityConnector;
  private connected: boolean = false;

  constructor() {
    this.connector = new SecurityConnector(new GitHubSecurityProvider());
  }

  provider(): string { return "GitHubSecurity"; }
  async connect(): Promise<void> { this.connected = true; }
  async disconnect(): Promise<void> { this.connected = false; }
  public getConnector(): SecurityConnector { return this.connector; }
}
