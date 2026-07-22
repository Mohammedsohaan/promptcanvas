import { SecurityModel } from "../../types/security";
import { DependencySecurityResult } from "../../types/security-context";
import { PlatformEventBus } from "../core/platform-event-bus";

export class DependencySecurityService {
  public analyze(model: SecurityModel): DependencySecurityResult {
    const vulns = model.vulnerabilities;
    const sbom = model.sbom;

    const knownVulnerabilities = vulns.length;
    const criticalDeps = vulns.filter(v => v.severity === "critical").map(v => v.affectedComponent);
    const licenseRisks = sbom
      ? sbom.components.filter(c => !["MIT", "Apache-2.0", "BSD-3-Clause", "ISC"].includes(c.license)).map(c => `${c.name}: ${c.license}`)
      : [];

    const result: DependencySecurityResult = {
      outdatedPackages: vulns.filter(v => v.fixAvailable).length,
      knownVulnerabilities,
      criticalDependencies: criticalDeps,
      licenseRisks,
      transitiveRisks: Math.floor(knownVulnerabilities * 0.3)
    };

    PlatformEventBus.getInstance().publish("DependenciesAnalyzed", { result });
    return result;
  }
}
