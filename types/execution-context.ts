import { EngineeringManagerContext } from './engineering-manager-context';
import { ExecutionAuthorization } from './execution-authorization';
import { ExecutionPlan } from './execution-plan';
import { ExecutionResult } from './execution-result';
import { ExecutionVerification } from './execution-verification';
import { RollbackPlan } from './rollback-plan';
import { RollbackResult } from './rollback-result';
import { AuditRecord } from './audit-record';

export interface ExecutionContext {
  id: string;
  engineeringManagerContext: EngineeringManagerContext;
  authorization: ExecutionAuthorization | null;
  plan: ExecutionPlan | null;
  result: ExecutionResult | null;
  verification: ExecutionVerification | null;
  rollbackPlan: RollbackPlan | null;
  rollbackResult: RollbackResult | null;
  auditRecords: AuditRecord[];
  timestamp: string;
}
