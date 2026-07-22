import { SecurityModel } from "../../types/security";
import { PolicyComplianceResult } from "../../types/security-context";
import { PlatformEventBus } from "../core/platform-event-bus";

export class PolicyComplianceService {
  public evaluate(model: SecurityModel): PolicyComplianceResult {
    const failedPolicies: string[] = [];
    const advisoryPolicies: string[] = [];

    for (const policy of model.policies) {
      const hasFailure = policy.rules.some(r => r.status === "failed");
      if (hasFailure && policy.enforcementLevel === "enforced") failedPolicies.push(policy.name);
      if (hasFailure && policy.enforcementLevel === "advisory") advisoryPolicies.push(policy.name);
    }

    const overallCompliance: PolicyComplianceResult["overallCompliance"] =
      failedPolicies.length > 0 ? "non_compliant" : advisoryPolicies.length > 0 ? "partial" : "compliant";

    const result: PolicyComplianceResult = {
      overallCompliance,
      failedPolicies,
      advisoryPolicies,
      encryptionStatus: "enforced",
      secretsManagement: failedPolicies.length > 0 ? "partial" : "enforced"
    };

    PlatformEventBus.getInstance().publish("PoliciesEvaluated", { result });
    return result;
  }
}
