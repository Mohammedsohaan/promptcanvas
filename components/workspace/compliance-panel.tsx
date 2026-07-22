import React from 'react';
import { ComplianceContext } from '../../types/compliance-context';

export const CompliancePanel = ({ context }: { context: ComplianceContext | null }) => {
  if (!context) return <div className="text-sm text-neutral-400">No Compliance Context Available</div>;

  return (
    <div className="p-6 mt-8 space-y-6 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl text-neutral-200">
      <h2 className="text-xl font-bold text-white">Enterprise Compliance & Governance</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border border-neutral-700 bg-neutral-800/50 rounded">
          <h3 className="font-semibold text-neutral-100 mb-2">Compliance Score</h3>
          <p className="text-sm text-neutral-300">Overall: <span className="font-medium text-white">{context.score.overallScore}</span></p>
          <p className="text-sm text-neutral-300">Status: <span className="font-medium text-white">{context.complianceResult.status}</span></p>
          <p className="text-sm text-neutral-300">Violations: <span className="font-medium text-white">{context.complianceResult.violations.length}</span></p>
        </div>
        
        <div className="p-4 border border-neutral-700 bg-neutral-800/50 rounded">
          <h3 className="font-semibold text-neutral-100 mb-2">Governance Status</h3>
          <p className="text-sm text-neutral-300">Decision: <span className="font-medium text-white">{context.governanceDecision.status}</span></p>
          <p className="text-sm text-neutral-300">Reason: <span className="font-medium text-white">{context.governanceDecision.reason}</span></p>
        </div>
        
        <div className="p-4 border border-neutral-700 bg-neutral-800/50 rounded">
          <h3 className="font-semibold text-neutral-100 mb-2">Approval Workflow</h3>
          <p className="text-sm text-neutral-300">Status: <span className="font-medium text-white">{context.approvalWorkflow.overallStatus}</span></p>
          <p className="text-sm text-neutral-300">Stages: <span className="font-medium text-white">{context.approvalWorkflow.stages.length}</span></p>
        </div>
        
        <div className="p-4 border border-neutral-700 bg-neutral-800/50 rounded">
          <h3 className="font-semibold text-neutral-100 mb-2">Audit Timeline</h3>
          <p className="text-sm text-neutral-300">Records Created: <span className="font-medium text-white">{context.auditRecords.length}</span></p>
          <p className="text-sm text-neutral-300">Latest Correlation: <span className="font-medium text-white text-xs">{context.auditRecords[0]?.correlationId || 'N/A'}</span></p>
        </div>
      </div>
      
    </div>
  );
};
