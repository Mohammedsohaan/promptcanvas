import React from 'react';
import { FinOpsContext } from '../../types/finops-context';

export const FinOpsPanel = ({ context }: { context: FinOpsContext | null }) => {
  return (
    <div className="finops-panel">
      <h2>Enterprise FinOps Intelligence</h2>
      <div className="metrics-grid">
        <div className="metric">
          <span>Monthly Spend</span>
          <strong>{context?.billingSummary?.currentSpend?.amount}</strong>
        </div>
        <div className="metric">
          <span>FinOps Score</span>
          <strong>{context?.finOpsScore?.overallScore}</strong>
        </div>
        <div className="metric">
          <span>Carbon Score</span>
          <strong>{context?.sustainability?.sustainabilityScore}</strong>
        </div>
      </div>
      <div className="ai-summary">
        <h3>AI Executive Summary</h3>
        <p>Loading AI explanation...</p>
      </div>
    </div>
  );
};
