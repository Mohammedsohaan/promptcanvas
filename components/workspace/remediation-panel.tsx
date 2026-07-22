import React from 'react';
import { RemediationContext } from '../../types/remediation-context';

export const RemediationPanel = ({ context }: { context: RemediationContext | null }) => {
  if (!context) return <div className="text-sm text-neutral-400">No Remediation Context Available</div>;

  return (
    <div className="p-6 mt-8 space-y-6 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl text-neutral-200">
      <h2 className="text-xl font-bold text-white">Enterprise Auto Remediation</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border border-neutral-700 bg-neutral-800/50 rounded">
          <h3 className="font-semibold text-neutral-100 mb-2">Overall Decision</h3>
          <p className="text-sm text-neutral-300">Health: <span className="font-medium text-white">{context.decision.overallHealth}</span></p>
          <p className="text-sm text-neutral-300">Risk: <span className="font-medium text-white">{context.decision.overallRisk}</span></p>
        </div>
        
        <div className="p-4 border border-neutral-700 bg-neutral-800/50 rounded">
          <h3 className="font-semibold text-neutral-100 mb-2">Policy Status</h3>
          <p className="text-sm text-neutral-300">Status: <span className="font-medium text-white">{context.policy.status}</span></p>
        </div>
        
        <div className="p-4 border border-neutral-700 bg-neutral-800/50 rounded">
          <h3 className="font-semibold text-neutral-100 mb-2">Approval Status</h3>
          <p className="text-sm text-neutral-300">State: <span className="font-medium text-white">{context.approvalState ? context.approvalState.state : 'None'}</span></p>
        </div>
        
        <div className="p-4 border border-neutral-700 bg-neutral-800/50 rounded">
          <h3 className="font-semibold text-neutral-100 mb-2">Execution Plan</h3>
          <p className="text-sm text-neutral-300">Actions: <span className="font-medium text-white">{context.plan.actions.length}</span></p>
          <p className="text-sm text-neutral-300">Duration: <span className="font-medium text-white">{context.plan.totalEstimatedDurationMs}ms</span></p>
          <p className="text-sm text-neutral-300">Rollback Steps: <span className="font-medium text-white">{context.rollbackPlan.actions.length}</span></p>
        </div>
      </div>
      
      <div className="p-4 border border-neutral-700 bg-neutral-800/50 rounded mt-4">
        <h3 className="font-semibold text-neutral-100 mb-2">Dry Run Results</h3>
        {context.executionResults.length === 0 ? (
          <p className="text-sm text-neutral-400">No executions run.</p>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {context.executionResults.map((result, i) => (
              <li key={i} className="text-sm text-neutral-300">
                <span className="font-medium text-white">{result.actionId}</span>: {result.status} <span className="text-neutral-500">({result.durationMs}ms)</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
