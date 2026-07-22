import { ConnectorPlugin } from "./interfaces/connector-plugin";
import { RuntimeConnector } from "../integration/runtime-connector";
import { OpenTelemetryProvider } from "../integration/opentelemetry-provider";

export class OpenTelemetryConnectorPlugin implements ConnectorPlugin {
  private connector: RuntimeConnector;
  private connected: boolean = false;

  constructor() {
    this.connector = new RuntimeConnector(new OpenTelemetryProvider());
  }

  provider(): string {
    return "OpenTelemetry";
  }

  async connect(credentials?: Record<string, any>): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  public getConnector(): RuntimeConnector {
    return this.connector;
  }
}
