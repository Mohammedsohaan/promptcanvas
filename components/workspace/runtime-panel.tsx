import React from "react";
import { RuntimeContext } from "../../types/runtime-context";

interface RuntimePanelProps {
  context: RuntimeContext;
}

export function RuntimePanel({ context }: RuntimePanelProps) {
  const { runtimeModel, healthAnalysis, incidentAnalysis, performanceAnalysis, capacityAnalysis, runtimeRecommendation } = context;

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-900 text-slate-100 rounded-lg shadow-xl w-full max-w-5xl">
      <div className="flex justify-between items-start border-b border-slate-700 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Runtime Intelligence
          </h2>
          <p className="text-slate-400 mt-1">
            Environment: {runtimeModel.environment.environmentName} | Cluster: {runtimeModel.environment.cluster}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            healthAnalysis.deploymentHealth === "healthy" ? "bg-green-500/20 text-green-400" :
            healthAnalysis.deploymentHealth === "failing" ? "bg-red-500/20 text-red-400" :
            "bg-yellow-500/20 text-yellow-400"
          }`}>
            {healthAnalysis.deploymentHealth.toUpperCase()}
          </span>
          <span className="text-xs text-slate-500 mt-2">
            Analyzed at {new Date(context.metadata.analyzedAt).toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Availability" value={`${healthAnalysis.availability.toFixed(1)}%`} isHighRisk={healthAnalysis.availability < 99.5} />
        <MetricCard label="P99 Latency" value={`${performanceAnalysis.p99}ms`} isHighRisk={performanceAnalysis.p99 > 500} />
        <MetricCard label="Error Rate" value={`${performanceAnalysis.errorRate}%`} isHighRisk={performanceAnalysis.errorRate > 1.0} />
        <MetricCard label="Active Incidents" value={incidentAnalysis.severity !== "none" ? incidentAnalysis.severity : "0"} isHighRisk={incidentAnalysis.severity !== "none"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 border-b border-slate-700 pb-2">Active Services</h3>
          <ul className="space-y-3 text-sm">
            {runtimeModel.services.map((service, idx) => (
              <li key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <StatusIndicator status={service.status} />
                  <span className="text-slate-200 font-medium">{service.name}</span>
                  <span className="text-xs text-slate-500">v{service.version}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-xs">{service.replicas} pods</span>
                  <span className={`${service.availability < 99.9 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {service.availability}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 border-b border-slate-700 pb-2">Capacity & Autoscaling</h3>
          <ul className="space-y-4 text-sm mt-4">
            <li>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">CPU Headroom</span>
                <span className="text-slate-200">{capacityAnalysis.cpuHeadroom}%</span>
              </div>
              <ProgressBar percentage={100 - capacityAnalysis.cpuHeadroom} color="bg-blue-500" />
            </li>
            <li>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Memory Headroom</span>
                <span className="text-slate-200">{capacityAnalysis.memoryHeadroom}%</span>
              </div>
              <ProgressBar percentage={100 - capacityAnalysis.memoryHeadroom} color="bg-purple-500" />
            </li>
          </ul>
          <div className="mt-6 p-3 bg-slate-700/50 rounded flex justify-between items-center">
            <span className="text-slate-400 text-xs uppercase">Action</span>
            <span className="text-slate-200 font-semibold">{capacityAnalysis.autoscalingRecommendation.replace("_", " ").toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-l-blue-500">
        <h3 className="text-lg font-semibold mb-3 border-b border-slate-700 pb-2">AI Operational Intelligence</h3>
        <div className="prose prose-invert max-w-none text-sm text-slate-300">
          <div className="flex items-center gap-2 mb-2">
            <strong className="text-white">System Status:</strong>
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
              runtimeRecommendation.severity === "critical" ? "bg-red-500/20 text-red-400" : 
              runtimeRecommendation.severity === "high" ? "bg-orange-500/20 text-orange-400" : 
              runtimeRecommendation.severity === "medium" ? "bg-yellow-500/20 text-yellow-400" : 
              "bg-green-500/20 text-green-400"
            }`}>{runtimeRecommendation.severity.toUpperCase()}</span>
          </div>

          <p className="mt-2 text-slate-200 font-medium">{runtimeRecommendation.recommendation}</p>
          
          {runtimeRecommendation.nextActions.length > 0 && (
            <div className="mt-4">
              <span className="font-semibold text-white block mb-1">Next Actions:</span>
              <ul className="list-decimal pl-5 space-y-1">
                {runtimeRecommendation.nextActions.map((na, i) => <li key={i}>{na}</li>)}
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

function StatusIndicator({ status }: { status: string }) {
  if (status === "healthy") return <span className="w-2 h-2 rounded-full bg-green-500"></span>;
  if (status === "degraded") return <span className="w-2 h-2 rounded-full bg-yellow-500"></span>;
  if (status === "unhealthy" || status === "offline") return <span className="w-2 h-2 rounded-full bg-red-500"></span>;
  return <span className="w-2 h-2 rounded-full bg-slate-500"></span>;
}

function ProgressBar({ percentage, color }: { percentage: number, color: string }) {
  return (
    <div className="w-full bg-slate-700 rounded-full h-1.5">
      <div className={`${color} h-1.5 rounded-full`} style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}></div>
    </div>
  );
}
