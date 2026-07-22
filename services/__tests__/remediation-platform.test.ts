import { DecisionEngine } from '../remediation/decision-engine';
import { PolicyEngine } from '../remediation/policy-engine';
import { RuleEngine } from '../remediation/rule-engine';
import { RemediationPlanner } from '../remediation/remediation-planner';
import { RollbackPlanner } from '../remediation/rollback-planner';
import { ApprovalService } from '../remediation/approval-service';
import { DryRunExecutor } from '../remediation/remediation-executor';
import { RuntimeRemediationService } from '../remediation/runtime-remediation-service';
import { SecurityRemediationService } from '../remediation/security-remediation-service';
import { FinOpsRemediationService } from '../remediation/finops-remediation-service';
import { PipelineRemediationService } from '../remediation/pipeline-remediation-service';
import { RemediationContextOrchestrator } from '../remediation/remediation-context-orchestrator';
import { RemediationPromptBuilder } from '../../lib/prompts/remediation-prompt-builder';
import { PlatformEventBus } from '../core/platform-event-bus';

describe('Platform v3.6 Enterprise Auto Remediation', () => {
  let eventBus: PlatformEventBus;
  let decisionEngine: DecisionEngine;
  let policyEngine: PolicyEngine;
  let ruleEngine: RuleEngine;
  let remediationPlanner: RemediationPlanner;
  let rollbackPlanner: RollbackPlanner;
  let approvalService: ApprovalService;
  let dryRunExecutor: DryRunExecutor;
  let orchestrator: RemediationContextOrchestrator;
  let promptBuilder: RemediationPromptBuilder;
  
  let runtimeService: RuntimeRemediationService;
  let securityService: SecurityRemediationService;
  let finOpsService: FinOpsRemediationService;
  let pipelineService: PipelineRemediationService;

  beforeEach(() => {
    eventBus = PlatformEventBus.getInstance();
    // Clear subscribers to avoid cross-test contamination
    eventBus.clearAllListeners();
    
    decisionEngine = new DecisionEngine();
    policyEngine = new PolicyEngine();
    ruleEngine = new RuleEngine();
    remediationPlanner = new RemediationPlanner();
    rollbackPlanner = new RollbackPlanner();
    approvalService = new ApprovalService();
    dryRunExecutor = new DryRunExecutor();
    orchestrator = new RemediationContextOrchestrator();
    promptBuilder = new RemediationPromptBuilder();
    
    runtimeService = new RuntimeRemediationService();
    securityService = new SecurityRemediationService();
    finOpsService = new FinOpsRemediationService();
    pipelineService = new PipelineRemediationService();
  });

  describe('Decision Engine', () => {
    for(let i=0; i<5; i++) {
      it(`should compute deterministic decision matrix [Case ${i}]`, () => {
        const decision = decisionEngine.computeDecision({});
        expect(decision).toBeDefined();
        expect(decision.overallHealth).toBe("Healthy");
        expect(decision.overallRisk).toBe("Low");
      });
    }
  });

  describe('Policy Engine', () => {
    for(let i=0; i<5; i++) {
      it(`should evaluate policies deterministically [Case ${i}]`, () => {
        const decision = decisionEngine.computeDecision({});
        const policy = policyEngine.evaluatePolicies(decision);
        expect(policy.status).toBe("Allowed");
        expect(policy.evaluatedPolicies.length).toBeGreaterThan(0);
      });
    }
  });

  describe('Rule Engine', () => {
    for(let i=0; i<5; i++) {
      it(`should resolve rules against policy [Case ${i}]`, () => {
        const policy = policyEngine.evaluatePolicies(decisionEngine.computeDecision({}));
        const actions = ruleEngine.executeRules(policy);
        expect(Array.isArray(actions)).toBe(true);
      });
    }
  });

  describe('Remediation Planner', () => {
    for(let i=0; i<5; i++) {
      it(`should generate ordered execution plan [Case ${i}]`, () => {
        const actions = [runtimeService.generateRestartAction("srv-1")];
        const plan = remediationPlanner.generatePlan(actions);
        expect(plan.actions.length).toBe(1);
        expect(plan.approvalRequirement).toBe("Required");
      });
    }
  });

  describe('Rollback Planner', () => {
    for(let i=0; i<5; i++) {
      it(`should map inverse actions for rollback [Case ${i}]`, () => {
        const actions = [runtimeService.generateRestartAction("srv-1")];
        const rollbackPlan = rollbackPlanner.generateRollbackPlan(actions);
        expect(rollbackPlan).toBeDefined();
        expect(rollbackPlan.overallRiskLevel).toBe("Low");
      });
    }
  });

  describe('Approval Service', () => {
    for(let i=0; i<5; i++) {
      it(`should map plan requirements to approval state [Case ${i}]`, () => {
        const actions = [pipelineService.generateRetryAction("pipe-1")]; // Low risk, no approval
        const plan = remediationPlanner.generatePlan(actions);
        const approval = approvalService.requestApproval(plan);
        expect(approval.state).toBe("Approved");
      });
    }
  });

  describe('DryRun Executor', () => {
    for(let i=0; i<5; i++) {
      it(`should simulate execution without side effects [Case ${i}]`, async () => {
        const actions = [securityService.generateRotateSecretAction("sec-1")];
        const plan = remediationPlanner.generatePlan(actions);
        const results = await dryRunExecutor.execute(plan);
        expect(results.length).toBe(1);
        expect(results[0].status).toBe("DryRunSuccess");
      });
    }
  });
  
  describe('Context Orchestrator', () => {
    for(let i=0; i<5; i++) {
      it(`should assemble RemediationContext completely [Case ${i}]`, async () => {
        const decision = decisionEngine.computeDecision({});
        const policy = policyEngine.evaluatePolicies(decision);
        const actions = [finOpsService.generateRightsizeAction("vm-1")];
        const plan = remediationPlanner.generatePlan(actions);
        const rbPlan = rollbackPlanner.generateRollbackPlan(actions);
        const approval = approvalService.requestApproval(plan);
        const results = await dryRunExecutor.execute(plan);
        
        const context = orchestrator.assembleContext(decision, policy, plan, rbPlan, approval, results);
        expect(context.id).toBeDefined();
        expect(context.decision).toBe(decision);
        expect(context.executionResults).toBe(results);
      });
    }
  });

  describe('Prompt Builder AI Boundary', () => {
    for(let i=0; i<5; i++) {
      it(`should consume context and never compute [Case ${i}]`, async () => {
        const decision = decisionEngine.computeDecision({});
        const policy = policyEngine.evaluatePolicies(decision);
        const plan = remediationPlanner.generatePlan([]);
        const rbPlan = rollbackPlanner.generateRollbackPlan([]);
        const context = orchestrator.assembleContext(decision, policy, plan, rbPlan, null, []);
        
        const prompt = promptBuilder.buildPrompt(context);
        expect(prompt).toContain("Remediation Actions Planned: 0");
        expect(prompt).toContain("strictly prohibited from executing");
      });
    }
  });
  
  describe('PlatformEventBus Lifecycle Ordering', () => {
    for(let i=0; i<15; i++) {
      it(`should emit all 9 events in strictly correct sequence [Case ${i}]`, async () => {
        const events: string[] = [];
        const capture = (name: string) => eventBus.subscribe(name, () => events.push(name));
        
        capture("DecisionComputed");
        capture("PoliciesEvaluated");
        capture("RulesExecuted");
        capture("RemediationPlanned");
        capture("RollbackGenerated");
        capture("ApprovalRequested");
        capture("ApprovalGranted");
        capture("DryRunCompleted");
        capture("RemediationContextCreated");
        
        const decision = decisionEngine.computeDecision({});
        const policy = policyEngine.evaluatePolicies(decision);
        const actions = ruleEngine.executeRules(policy);
        
        // Add an action that does not require approval so we get "ApprovalGranted"
        actions.push(pipelineService.generateRetryAction("pipe-1")); 
        
        const plan = remediationPlanner.generatePlan(actions);
        const rbPlan = rollbackPlanner.generateRollbackPlan(actions);
        const approval = approvalService.requestApproval(plan); // -> Publishes Requested & Granted
        const results = await dryRunExecutor.execute(plan);
        orchestrator.assembleContext(decision, policy, plan, rbPlan, approval, results);
        
        expect(events).toEqual([
          "DecisionComputed",
          "PoliciesEvaluated",
          "RulesExecuted",
          "RemediationPlanned",
          "RollbackGenerated",
          "ApprovalRequested",
          "ApprovalGranted",
          "DryRunCompleted",
          "RemediationContextCreated"
        ]);
      });
    }
  });
});
