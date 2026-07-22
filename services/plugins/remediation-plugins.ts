export class DecisionCapabilityPlugin {
  public id = "plugin-decision-engine";
  public name = "Decision Engine Capability";
  public version = "3.6.0";
  
  public analyze(): unknown { return {}; }
}

export class PolicyCapabilityPlugin {
  public id = "plugin-policy-engine";
  public name = "Policy Engine Capability";
  public version = "3.6.0";
  
  public analyze(): unknown { return {}; }
}

export class RemediationCapabilityPlugin {
  public id = "plugin-remediation-engine";
  public name = "Remediation Engine Capability";
  public version = "3.6.0";
  
  public analyze(): unknown { return {}; }
}

export class ExecutorPlugin {
  public id = "plugin-dryrun-executor";
  public name = "DryRun Executor Plugin";
  public version = "3.6.0";
  
  public analyze(): unknown { return {}; }
}
