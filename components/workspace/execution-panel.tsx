import React from 'react';
import { ExecutionContext } from '../../types/execution-context';

export const ExecutionPanel = ({ context }: { context: ExecutionContext | null }) => {
  if (!context) return <div className="text-sm text-neutral-400">No Execution Context Available</div>;

  return (
    <div className="p-6 mt-8 space-y-6 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl text-neutral-200">
      <h2 className="text-xl font-bold text-white">Controlled Production Executor</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border border-neutral-700 bg-neutral-800/50 rounded">
          <h3 className="font-semibold text-neutral-100 mb-2">Authorization</h3>
          <p className="text-sm text-neutral-300">Status: <span className="font-medium text-white">{context.authorization?.status || 'N/A'}</span></p>
          <p className="text-sm text-neutral-300">Requested By: <span className="font-medium text-white">{context.authorization?.requestedBy || 'N/A'}</span></p>
        </div>
        
        <div className="p-4 border border-neutral-700 bg-neutral-800/50 rounded">
          <h3 className="font-semibold text-neutral-100 mb-2">Execution Status</h3>
          <p className="text-sm text-neutral-300">Status: <span className="font-medium text-white">{context.result?.status || 'Pending'}</span></p>
          <p className="text-sm text-neutral-300">Steps: <span className="font-medium text-white">{context.plan?.steps.length || 0}</span></p>
        </div>
        
        <div className="p-4 border border-neutral-700 bg-neutral-800/50 rounded">
          <h3 className="font-semibold text-neutral-100 mb-2">Verification</h3>
          <p className="text-sm text-neutral-300">Verified: <span className="font-medium text-white">{context.verification?.isVerified ? 'Yes' : 'No'}</span></p>
          <p className="text-sm text-neutral-300">Health: <span className="font-medium text-white">{context.verification?.healthStatus || 'N/A'}</span></p>
        </div>
        
        <div className="p-4 border border-neutral-700 bg-neutral-800/50 rounded">
          <h3 className="font-semibold text-neutral-100 mb-2">Rollback</h3>
          <p className="text-sm text-neutral-300">Plan Generated: <span className="font-medium text-white">{context.rollbackPlan ? 'Yes' : 'No'}</span></p>
          <p className="text-sm text-neutral-300">Status: <span className="font-medium text-white">{context.rollbackResult?.success ? 'Successful' : 'N/A'}</span></p>
        </div>
      </div>
      
    </div>
  );
};
