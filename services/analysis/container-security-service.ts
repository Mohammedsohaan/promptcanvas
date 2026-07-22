import { SecurityModel } from "../../types/security";
import { ContainerSecurityResult } from "../../types/container-security";
import { PlatformEventBus } from "../core/platform-event-bus";

export class ContainerSecurityService {
  public analyze(model: SecurityModel): ContainerSecurityResult {
    const result = model.containerSecurity || {
      baseImageRisk: "safe" as const, criticalCVEs: 0, privilegeEscalation: false, rootContainers: false, misconfigurations: []
    };
    PlatformEventBus.getInstance().publish("ContainersAnalyzed", { result });
    return result;
  }
}
