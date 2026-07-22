export interface SecurityPolicy {
  id: string;
  name: string;
  scope: "organization" | "repository" | "pipeline" | "runtime";
  rules: PolicyRule[];
  enforcementLevel: "enforced" | "advisory" | "disabled";
}

export interface PolicyRule {
  id: string;
  description: string;
  status: "passed" | "failed" | "warning" | "not_evaluated";
}
