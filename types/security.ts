import { Vulnerability } from "./vulnerability";
import { SecurityFinding } from "./security-finding";
import { SecurityPolicy } from "./security-policy";
import { SBOMModel } from "./sbom";
import { ContainerSecurityResult } from "./container-security";
import { ArtifactIntegrityResult } from "./artifact-integrity";

export interface SecurityModel {
  id: string;
  provider: string;
  scanTimestamp: string;
  vulnerabilities: Vulnerability[];
  findings: SecurityFinding[];
  policies: SecurityPolicy[];
  sbom?: SBOMModel;
  containerSecurity?: ContainerSecurityResult;
  artifactIntegrity?: ArtifactIntegrityResult;
}
