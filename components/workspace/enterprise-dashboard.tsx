import React from 'react';
import { EnterpriseContext } from '../../types/enterprise-context';

export const EnterpriseDashboard = ({ context }: { context: EnterpriseContext | null }) => {
  if (!context) return <div className="p-8 text-neutral-400">Loading Enterprise Intelligence...</div>;

  return (
    <div className="p-8 min-h-screen bg-neutral-950 text-neutral-200">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="border-b border-neutral-800 pb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">Enterprise Intelligent Engineering</h1>
          <p className="text-neutral-400 mt-2">Organization-wide visibility, forecasting, and strategic intelligence.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Organization Health</h2>
            <div className="text-4xl font-bold text-green-400">
              {context.organizationHealth?.executiveScore || 0}
            </div>
            <p className="text-sm text-neutral-400 mt-2">Executive Score</p>
          </div>
          
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Portfolio Stability</h2>
            <div className="text-4xl font-bold text-blue-400">
              {context.portfolioHealth?.portfolioStability || 0}%
            </div>
            <p className="text-sm text-neutral-400 mt-2">Across all active projects</p>
          </div>

          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Engineering Capacity</h2>
            <div className="text-4xl font-bold text-purple-400">
              {context.engineeringCapacity?.utilization || 0}%
            </div>
            <p className="text-sm text-neutral-400 mt-2">Current Utilization</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Strategic Risks</h2>
            <ul className="space-y-3">
              <li className="flex justify-between items-center text-sm">
                <span className="text-neutral-300">Infrastructure</span>
                <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded font-medium">{context.riskForecast?.infrastructureRisk || 'Unknown'}</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="text-neutral-300">Security</span>
                <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded font-medium">{context.riskForecast?.securityRisk || 'Unknown'}</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="text-neutral-300">Delivery</span>
                <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded font-medium">{context.riskForecast?.deliveryRisk || 'Unknown'}</span>
              </li>
            </ul>
          </div>

          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Executive Recommendations</h2>
            <div className="space-y-4">
              {context.recommendations?.map(rec => (
                <div key={rec.id} className="border-l-2 border-blue-500 pl-4">
                  <h4 className="font-medium text-white text-sm">{rec.category} - {rec.priority}</h4>
                  <p className="text-sm text-neutral-400 mt-1">{rec.reason}</p>
                </div>
              ))}
              {(!context.recommendations || context.recommendations.length === 0) && (
                <p className="text-sm text-neutral-500">No active recommendations.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
