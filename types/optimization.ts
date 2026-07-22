export interface OptimizationAnalysis {
  rightsizingOpportunities: number;
  reservedInstanceOpportunities: number;
  spotOpportunities: number;
  storageTieringOpportunities: number;
  autoscalingImprovements: number;
  idleCleanupOpportunities: number;
}
