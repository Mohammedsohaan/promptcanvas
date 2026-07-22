export interface ConnectorPlugin {
  provider(): string;
  connect(credentials?: Record<string, any>): Promise<void>;
  disconnect(): Promise<void>;
}
