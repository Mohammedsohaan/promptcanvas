import React from 'react';
import { EngineeringManagerContext } from '../../types/engineering-manager-context';

export const EngineeringManagerPanel = ({ context }: { context: EngineeringManagerContext | null }) => {
  if (!context) return <div className="text-sm text-neutral-400">No Engineering Manager Context Available</div>;

  return (
    <div className="p-6 mt-8 space-y-6 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl text-neutral-200">
      <h2 className="text-xl font-bold text-white">Enterprise AI Engineering Manager</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border border-neutral-700 bg-neutral-800/50 rounded">
          <h3 className="font-semibold text-neutral-100 mb-2">Engineering Health</h3>
          <p className="text-sm text-neutral-300">Score: <span className="font-medium text-white">{context.engineeringHealth.overallScore}</span></p>
          <p className="text-sm text-neutral-300">Security: <span className="font-medium text-white">{context.engineeringHealth.securityHealth}</span></p>
          <p className="text-sm text-neutral-300">Compliance: <span className="font-medium text-white">{context.engineeringHealth.complianceHealth}</span></p>
        </div>
        
        <div className="p-4 border border-neutral-700 bg-neutral-800/50 rounded">
          <h3 className="font-semibold text-neutral-100 mb-2">Release Readiness</h3>
          <p className="text-sm text-neutral-300">Status: <span className="font-medium text-white">{context.releaseReadiness.isReady ? "Ready" : "Blocked"}</span></p>
          <p className="text-sm text-neutral-300">Score: <span className="font-medium text-white">{context.releaseReadiness.overallScore}</span></p>
          <p className="text-sm text-neutral-300">Blocking Issues: <span className="font-medium text-white">{context.releaseReadiness.blockingIssues.length}</span></p>
        </div>
        
        <div className="p-4 border border-neutral-700 bg-neutral-800/50 rounded">
          <h3 className="font-semibold text-neutral-100 mb-2">Technical Debt</h3>
          <p className="text-sm text-neutral-300">Total Debt: <span className="font-medium text-white">{context.technicalDebt.totalDebtHours} hrs</span></p>
          <p className="text-sm text-neutral-300">Items: <span className="font-medium text-white">{context.technicalDebt.items.length}</span></p>
        </div>
        
        <div className="p-4 border border-neutral-700 bg-neutral-800/50 rounded">
          <h3 className="font-semibold text-neutral-100 mb-2">Project Health</h3>
          <p className="text-sm text-neutral-300">Status: <span className="font-medium text-white">{context.projectHealth.overallHealth}</span></p>
          <p className="text-sm text-neutral-300">Confidence: <span className="font-medium text-white">{context.projectHealth.deliveryConfidence}%</span></p>
        </div>
      </div>
      
    </div>
  );
};
