import { GovernanceDecision } from '../../types/governance-decision';

export interface IGovernanceProvider {
  evaluatePolicy(policyId: string): Promise<GovernanceDecision>;
  syncComplianceState(): Promise<void>;
}

// Interfaces for future implementations (No actual production integrations yet)
export interface ServiceNowProvider extends IGovernanceProvider {}
export interface JiraServiceManagementProvider extends IGovernanceProvider {}
export interface AzurePolicyProvider extends IGovernanceProvider {}
export interface AWSAuditManagerProvider extends IGovernanceProvider {}
export interface MicrosoftPurviewProvider extends IGovernanceProvider {}
export interface GoogleOrganizationPolicyProvider extends IGovernanceProvider {}
