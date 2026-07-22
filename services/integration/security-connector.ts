import { SecurityProvider } from "./security-provider";
import { SecurityModel } from "../../types/security";
import { PlatformEventBus } from "../core/platform-event-bus";

export class SecurityConnector {
  constructor(private provider: SecurityProvider) {}

  public async scan(repositoryId: string, options?: Record<string, any>): Promise<SecurityModel> {
    PlatformEventBus.getInstance().publish("SecurityScanStarted", { provider: this.provider.name(), repositoryId });
    const model = await this.provider.scan(repositoryId, options);
    return model;
  }
}
