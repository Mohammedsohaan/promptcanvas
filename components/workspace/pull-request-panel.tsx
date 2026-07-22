import React from "react";
import { PullRequestContext } from "../../types/pull-request";

interface PullRequestPanelProps {
  context: PullRequestContext;
}

export function PullRequestPanel({ context }: PullRequestPanelProps) {
  const { mergeReadiness, repositoryDiff, reviewRecommendation, impactAnalysis } = context;

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-900 text-slate-100 rounded-lg shadow-xl w-full max-w-4xl">
      <div className="flex justify-between items-start border-b border-slate-700 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Pull Request Intelligence
          </h2>
          <p className="text-slate-400 mt-1">
            {repositoryDiff.headBranch} → {repositoryDiff.baseBranch}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            reviewRecommendation.decision === "approve" ? "bg-green-500/20 text-green-400" :
            reviewRecommendation.decision === "request_changes" ? "bg-red-500/20 text-red-400" :
            "bg-yellow-500/20 text-yellow-400"
          }`}>
            {reviewRecommendation.decision.replace("_", " ").toUpperCase()}
          </span>
          <span className="text-xs text-slate-500 mt-2">
            Analyzed at {new Date(context.metadata.analyzedAt).toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Risk Score" value={mergeReadiness.riskScore.toString()} isHighRisk={mergeReadiness.riskScore > 50} />
        <MetricCard label="Complexity" value={mergeReadiness.reviewComplexity} />
        <MetricCard label="Est. Review Time" value={`${mergeReadiness.estimatedReviewMinutes} min`} />
        <MetricCard label="Code Churn" value={`${mergeReadiness.codeChurn} loc`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 border-b border-slate-700 pb-2">Impact Analysis</h3>
          <ul className="space-y-2 text-sm">
            <ImpactItem label="Stories" items={impactAnalysis.impactedStories} />
            <ImpactItem label="APIs" items={impactAnalysis.impactedAPIs} />
            <ImpactItem label="Database" items={impactAnalysis.impactedDatabaseSchemas} />
            <ImpactItem label="Tests" items={impactAnalysis.impactedTestCases} />
          </ul>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 border-b border-slate-700 pb-2">Readiness Delta</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="text-slate-400">Architecture</span>
              <span className="text-slate-200">{mergeReadiness.architectureImpact}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-400">Security</span>
              <span className="text-slate-200">{mergeReadiness.securityImpact}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-400">Release</span>
              <span className="text-slate-200">{mergeReadiness.releaseDelta}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-400">Coverage Delta</span>
              <span className={mergeReadiness.testCoverageDelta < 0 ? "text-red-400" : "text-green-400"}>
                {mergeReadiness.testCoverageDelta > 0 ? "+" : ""}{mergeReadiness.testCoverageDelta}%
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-slate-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 border-b border-slate-700 pb-2">AI Review Commentary</h3>
        <div className="prose prose-invert max-w-none text-sm text-slate-300">
          <p className="whitespace-pre-wrap">{reviewRecommendation.reason}</p>
          
          {reviewRecommendation.blockers.length > 0 && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded text-red-200">
              <span className="font-semibold block mb-1">Blockers:</span>
              <ul className="list-disc pl-5">
                {reviewRecommendation.blockers.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}

          {reviewRecommendation.nextActions.length > 0 && (
            <div className="mt-4">
              <span className="font-semibold text-white block mb-1">Suggested Next Actions:</span>
              <ul className="list-decimal pl-5">
                {reviewRecommendation.nextActions.map((na, i) => <li key={i}>{na}</li>)}
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

function ImpactItem({ label, items }: { label: string, items: string[] }) {
  if (items.length === 0) return (
    <li className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-600">None</span>
    </li>
  );
  
  return (
    <li className="flex flex-col">
      <div className="flex justify-between">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-200">{items.length} impacted</span>
      </div>
    </li>
  );
}
