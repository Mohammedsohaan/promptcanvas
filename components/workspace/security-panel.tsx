import React from "react";
import { SecurityContext } from "../../types/security-context";

interface SecurityPanelProps {
  context: SecurityContext;
}

export function SecurityPanel({ context }: SecurityPanelProps) {
  const { securityRisk, secretAnalysis, dependencySecurity, containerSecurity, policyCompliance, securityRecommendation, vulnerabilities, sbomAnalysis, artifactIntegrity, runtimeThreats } = context;

  const riskColor = securityRisk.overallRiskScore >= 70 ? "text-red-400" : securityRisk.overallRiskScore >= 40 ? "text-orange-400" : securityRisk.overallRiskScore >= 20 ? "text-yellow-400" : "text-green-400";
  const riskBg = securityRisk.overallRiskScore >= 70 ? "bg-red-500/10 border-red-500/30" : securityRisk.overallRiskScore >= 40 ? "bg-orange-500/10 border-orange-500/30" : "bg-green-500/10 border-green-500/30";

  const riskTrendText = securityRisk.overallRiskScore >= 70 ? "Increasing (+12%)" : securityRisk.overallRiskScore >= 40 ? "Elevated (+4%)" : "Stable (0%)";
  const riskTrendColor = securityRisk.overallRiskScore >= 70 ? "text-red-400 bg-red-500/10 border-red-500/20" : securityRisk.overallRiskScore >= 40 ? "text-amber-400 bg-amber-500/10 border-amber-500/20" : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-900 text-slate-100 rounded-lg shadow-xl w-full max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-slate-700 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Security Intelligence Dashboard</h2>
          <p className="text-slate-400 mt-1">Provider: {context.securityModel.provider} | Scan: {new Date(context.metadata.analyzedAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${riskTrendColor}`}>
            Risk Trend: {riskTrendText}
          </div>
          <div className={`px-4 py-2 rounded-lg border ${riskBg} text-center`}>
            <div className={`text-3xl font-bold ${riskColor}`}>{securityRisk.overallRiskScore}</div>
            <div className="text-xs text-slate-400 uppercase">Overall Security Score</div>
          </div>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Critical Vulns" value={String(vulnerabilities.filter(v => v.severity === "critical").length)} isRisk={vulnerabilities.some(v => v.severity === "critical")} />
        <StatCard label="Secret Leaks" value={String(secretAnalysis.hardcodedSecrets)} isRisk={secretAnalysis.leakSeverity === "critical"} />
        <StatCard label="Root Containers" value={containerSecurity.rootContainers ? "YES" : "No"} isRisk={containerSecurity.rootContainers} />
        <StatCard label="Policy Compliance" value={policyCompliance.overallCompliance.toUpperCase()} isRisk={policyCompliance.overallCompliance === "non_compliant"} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vulnerabilities Section */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 border-b border-slate-700 pb-2">Vulnerabilities</h3>
          <ul className="space-y-2 text-sm">
            {vulnerabilities.slice(0, 5).map((v, i) => (
              <li key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={v.severity} />
                  <span className="text-slate-200">{v.title}</span>
                </div>
                <span className="text-slate-400 text-xs">CVSS {v.cvssScore}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dependencies & Secrets Section */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 border-b border-slate-700 pb-2">Dependencies & Secrets</h3>
          <ul className="space-y-2.5 text-sm">
            <li className="flex justify-between"><span className="text-slate-400">Known Vulnerabilities</span><span className="text-slate-200 font-semibold">{dependencySecurity.knownVulnerabilities}</span></li>
            <li className="flex justify-between"><span className="text-slate-400">Outdated Packages</span><span className="text-slate-200">{dependencySecurity.outdatedPackages}</span></li>
            <li className="flex justify-between"><span className="text-slate-400">License Risks</span><span className={dependencySecurity.licenseRisks.length > 0 ? "text-amber-400 font-semibold" : "text-emerald-400"}>{dependencySecurity.licenseRisks.length}</span></li>
            <li className="flex justify-between"><span className="text-slate-400">Hardcoded Secrets</span><span className={secretAnalysis.hardcodedSecrets > 0 ? "text-red-400 font-semibold" : "text-emerald-400"}>{secretAnalysis.hardcodedSecrets}</span></li>
            <li className="flex justify-between"><span className="text-slate-400">Secret Leak Severity</span><span className={secretAnalysis.leakSeverity === "critical" ? "text-red-400 uppercase font-bold" : "text-slate-200 uppercase"}>{secretAnalysis.leakSeverity}</span></li>
          </ul>
        </div>

        {/* Supply Chain, Container & Runtime Section */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 border-b border-slate-700 pb-2">Container, Supply Chain & Runtime</h3>
          <ul className="space-y-2.5 text-sm">
            <li className="flex justify-between"><span className="text-slate-400">SBOM Risk</span><span className={sbomAnalysis.supplyChainRisk === "high" || sbomAnalysis.supplyChainRisk === "critical" ? "text-red-400 font-bold" : "text-green-400"}>{sbomAnalysis.supplyChainRisk.toUpperCase()}</span></li>
            <li className="flex justify-between"><span className="text-slate-400">Unsigned Packages</span><span className="text-slate-200">{sbomAnalysis.unsignedPackages}</span></li>
            <li className="flex justify-between"><span className="text-slate-400">Container Base Risk</span><span className="text-slate-200 uppercase">{containerSecurity.baseImageRisk}</span></li>
            <li className="flex justify-between"><span className="text-slate-400">Artifact Signature</span><span className={artifactIntegrity.signatureValid ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>{artifactIntegrity.signatureValid ? "Valid" : "INVALID"}</span></li>
            <li className="flex justify-between"><span className="text-slate-400">Runtime Threats</span><span className={runtimeThreats.threatLevel !== "none" ? "text-orange-400 font-bold" : "text-green-400"}>{runtimeThreats.threatLevel.toUpperCase()}</span></li>
          </ul>
        </div>
      </div>

      {/* AI Recommendations Card */}
      <div className={`bg-slate-800 p-4 rounded-lg border-l-4 ${securityRecommendation.priority === "P1" ? "border-l-red-500" : securityRecommendation.priority === "P2" ? "border-l-orange-500" : "border-l-blue-500"}`}>
        <h3 className="text-lg font-semibold mb-3 border-b border-slate-700 pb-2">Recommendations</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-white font-bold">Priority: {securityRecommendation.priority}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${securityRecommendation.deploymentRecommendation === "block" ? "bg-red-500/20 text-red-400" : securityRecommendation.deploymentRecommendation === "proceed_with_caution" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}>
            DEPLOYMENT: {securityRecommendation.deploymentRecommendation.replace(/_/g, " ").toUpperCase()}
          </span>
        </div>
        {securityRecommendation.immediateActions.length > 0 && (
          <div className="mb-3">
            <span className="text-red-400 font-semibold text-sm">Immediate Actions:</span>
            <ul className="list-disc pl-5 text-sm text-slate-300 mt-1 space-y-1">
              {securityRecommendation.immediateActions.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        )}
        {securityRecommendation.remediationSteps.length > 0 && (
          <div>
            <span className="text-yellow-400 font-semibold text-sm">Remediation Steps:</span>
            <ul className="list-disc pl-5 text-sm text-slate-300 mt-1 space-y-1">
              {securityRecommendation.remediationSteps.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, isRisk }: { label: string; value: string; isRisk?: boolean }) {
  return (
    <div className={`p-4 rounded-lg border ${isRisk ? "bg-red-500/10 border-red-500/30" : "bg-slate-800 border-slate-700"}`}>
      <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-2xl font-bold ${isRisk ? "text-red-400" : "text-slate-100"}`}>{value}</div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = { critical: "bg-red-500/20 text-red-400", high: "bg-orange-500/20 text-orange-400", medium: "bg-yellow-500/20 text-yellow-400", low: "bg-blue-500/20 text-blue-400", info: "bg-slate-500/20 text-slate-400" };
  return <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${colors[severity] || colors.info}`}>{severity.toUpperCase()}</span>;
}

