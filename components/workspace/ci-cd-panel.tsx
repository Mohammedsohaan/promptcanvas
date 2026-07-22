import React from "react";
import { PipelineContext } from "../../types/pipeline-context";

interface CiCdPanelProps {
  context: PipelineContext;
}

export function CiCdPanel({ context }: CiCdPanelProps) {
  const { pipelineModel, pipelineAnalysis, qualityGate, deploymentRisk, pipelineRecommendation } = context;

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-900 text-slate-100 rounded-lg shadow-xl w-full max-w-5xl">
      <div className="flex justify-between items-start border-b border-slate-700 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            CI/CD Intelligence
          </h2>
          <p className="text-slate-400 mt-1">
            {pipelineModel.workflow} - {pipelineModel.branch}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            pipelineModel.status === "success" ? "bg-green-500/20 text-green-400" :
            pipelineModel.status === "failed" ? "bg-red-500/20 text-red-400" :
            "bg-blue-500/20 text-blue-400"
          }`}>
            {pipelineModel.status.toUpperCase()}
          </span>
          <span className="text-xs text-slate-500 mt-2">
            Analyzed at {new Date(context.metadata.analyzedAt).toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Exec Time" value={`${(pipelineAnalysis.executionDuration / 1000).toFixed(1)}s`} />
        <MetricCard label="Quality Gate" value={qualityGate.status.toUpperCase()} isHighRisk={qualityGate.status === "failed"} />
        <MetricCard label="Deploy Risk" value={deploymentRisk.deploymentRisk.toUpperCase()} isHighRisk={deploymentRisk.deploymentRisk === "high" || deploymentRisk.deploymentRisk === "critical"} />
        <MetricCard label="Success Rate" value={`${pipelineAnalysis.historicalSuccessRate.toFixed(0)}%`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 border-b border-slate-700 pb-2">Stages & Timeline</h3>
          <ul className="space-y-3">
            {pipelineModel.stages.map((stage, idx) => (
              <li key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <StatusIcon status={stage.status} />
                  <span className="text-slate-200">{stage.name}</span>
                  {stage.retryCount > 0 && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-500 px-1.5 rounded">Retry x{stage.retryCount}</span>
                  )}
                </div>
                <span className="text-slate-400 text-sm">{(stage.duration / 1000).toFixed(1)}s</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 border-b border-slate-700 pb-2">Quality & Security</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="text-slate-400">Unit Tests</span>
              <span className={qualityGate.unitTests === "failed" ? "text-red-400" : "text-green-400"}>{qualityGate.unitTests}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-400">Coverage</span>
              <span className="text-slate-200">{qualityGate.coverage}%</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-400">Security Scan</span>
              <span className={qualityGate.securityScan === "failed" ? "text-red-400" : "text-green-400"}>{qualityGate.securityScan}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-400">Secret Scan</span>
              <span className={qualityGate.secretScan === "failed" ? "text-red-400" : "text-green-400"}>{qualityGate.secretScan}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-l-blue-500">
        <h3 className="text-lg font-semibold mb-3 border-b border-slate-700 pb-2">Actionable Intelligence</h3>
        <div className="prose prose-invert max-w-none text-sm text-slate-300">
          <div className="flex items-center gap-2 mb-2">
            <strong className="text-white">Recommendation:</strong>
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
              pipelineRecommendation.decision === "proceed" ? "bg-green-500/20 text-green-400" : 
              pipelineRecommendation.decision === "block" ? "bg-red-500/20 text-red-400" : 
              "bg-yellow-500/20 text-yellow-400"
            }`}>{pipelineRecommendation.decision.toUpperCase()}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Deployment Strategy</span>
              <div className="text-slate-200">{pipelineRecommendation.deploymentStrategy}</div>
            </div>
            <div>
              <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Rollback Strategy</span>
              <div className="text-slate-200">{pipelineRecommendation.rollbackStrategy}</div>
            </div>
          </div>
          
          {pipelineRecommendation.blockers.length > 0 && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded text-red-200">
              <span className="font-semibold block mb-1">Pipeline Blockers:</span>
              <ul className="list-disc pl-5">
                {pipelineRecommendation.blockers.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}

          {pipelineRecommendation.nextActions.length > 0 && (
            <div className="mt-4">
              <span className="font-semibold text-white block mb-1">Next Actions:</span>
              <ul className="list-decimal pl-5">
                {pipelineRecommendation.nextActions.map((na, i) => <li key={i}>{na}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, isHighRisk }: { label: string, value: string, isHighRisk?: boolean }) {
  return (
    <div className={`p-4 rounded-lg border ${isHighRisk ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800 border-slate-700'}`}>
      <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-2xl font-bold ${isHighRisk ? 'text-red-400' : 'text-slate-100'}`}>{value}</div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "success") return <span className="text-green-500 font-bold">✓</span>;
  if (status === "failed") return <span className="text-red-500 font-bold">✗</span>;
  if (status === "running") return <span className="text-blue-500 font-bold">↻</span>;
  return <span className="text-slate-500 font-bold">-</span>;
}
