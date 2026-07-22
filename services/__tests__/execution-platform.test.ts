import { ExecutionAuthorizationEngine } from '../execution/execution-authorization-engine';
import { ExecutionPlanner } from '../execution/execution-planner';
import { ProductionExecutor } from '../execution/production-executor';
import { ExecutionVerificationEngine } from '../execution/execution-verification-engine';
import { RollbackEngine } from '../execution/rollback-engine';
import { ExecutionContextOrchestrator } from '../execution/execution-context-orchestrator';
import { ProductionPromptBuilder } from '../../lib/prompts/production-prompt-builder';
import { PlatformEventBus } from '../core/platform-event-bus';

describe('Platform v3.9 Controlled Production Executors', () => {
  let eventBus: PlatformEventBus;
  
  let authEngine: ExecutionAuthorizationEngine;
  let planner: ExecutionPlanner;
  let executor: ProductionExecutor;
  let verifier: ExecutionVerificationEngine;
  let rollbackEngine: RollbackEngine;
  
  let orchestrator: ExecutionContextOrchestrator;
  let promptBuilder: ProductionPromptBuilder;

  beforeEach(() => {
    eventBus = PlatformEventBus.getInstance();
    // Clear subscribers
    (eventBus as any)['subscribers'] = new Map();
    
    authEngine = new ExecutionAuthorizationEngine();
    planner = new ExecutionPlanner();
    executor = new ProductionExecutor();
    verifier = new ExecutionVerificationEngine();
    rollbackEngine = new RollbackEngine();
    
    orchestrator = new ExecutionContextOrchestrator();
    promptBuilder = new ProductionPromptBuilder();
  });

  describe('Execution Authorization Engine', () => {
    for(let i=0; i<10; i++) {
      it(`should generate immutable authorization [Case ${i}]`, () => {
        const auth = authEngine.authorizeExecution({});
        expect(auth.status).toBe("Authorized");
        // Verify immutability
        expect(() => { (auth as any).status = "Denied"; }).toThrow();
        expect(() => { (auth.approvalChain as any).push("Hacker"); }).toThrow();
      });
    }
  });

  describe('Execution Planner', () => {
    for(let i=0; i<10; i++) {
      it(`should generate deterministic execution plan [Case ${i}]`, () => {
        const auth = authEngine.authorizeExecution({});
        const plan = planner.generatePlan(auth);
        expect(plan.steps.length).toBeGreaterThan(0);
        expect(plan.authorizationId).toBe(auth.authorizationId);
        expect(plan.steps[0].action.type).toBe("RestartService");
      });
    }
  });

  describe('Production Executor', () => {
    for(let i=0; i<10; i++) {
      it(`should execute plan when authorized [Case ${i}]`, async () => {
        const auth = authEngine.authorizeExecution({});
        const plan = planner.generatePlan(auth);
        const result = await executor.executePlan(plan, auth);
        expect(result.status).toBe("Completed");
        expect(result.planId).toBe(plan.planId);
      });
      
      it(`should reject execution when unauthorized [Case ${i}]`, async () => {
        const auth = { status: "Denied" } as any;
        const plan = { planId: "test-plan" } as any;
        await expect(executor.executePlan(plan, auth)).rejects.toThrow("Execution not authorized");
      });
    }
  });

  describe('Execution Verification Engine', () => {
    for(let i=0; i<10; i++) {
      it(`should verify execution deterministically [Case ${i}]`, () => {
        const result = { executionId: "exec-1", status: "Completed" } as any;
        const verification = verifier.verifyExecution(result);
        expect(verification.isVerified).toBe(true);
        expect(verification.healthStatus).toBe("Healthy");
      });
      
      it(`should fail verification deterministically [Case ${i}]`, () => {
        const result = { executionId: "exec-2", status: "Failed" } as any;
        const verification = verifier.verifyExecution(result);
        expect(verification.isVerified).toBe(false);
        expect(verification.healthStatus).toBe("Unknown");
      });
    }
  });

  describe('Rollback Engine', () => {
    for(let i=0; i<10; i++) {
      it(`should NOT generate rollback plan if verified [Case ${i}]`, () => {
        const verification = { executionId: "exec-1", isVerified: true } as any;
        const rollbackPlan = rollbackEngine.generateRollbackPlan(verification);
        expect(rollbackPlan).toBeNull();
      });
    }
    for(let i=0; i<10; i++) {
      it(`should generate rollback plan if verification fails [Case ${i}]`, async () => {
        const verification = { executionId: "exec-2", isVerified: false, desiredState: {} } as any;
        const rollbackPlan = rollbackEngine.generateRollbackPlan(verification);
        expect(rollbackPlan).not.toBeNull();
        expect(rollbackPlan!.executionId).toBe("exec-2");
        
        const rollbackResult = await rollbackEngine.executeRollback(rollbackPlan!);
        expect(rollbackResult.success).toBe(true);
      });
    }
  });

  describe('Context Orchestrator', () => {
    for(let i=0; i<5; i++) {
      it(`should assemble ExecutionContext completely [Case ${i}]`, () => {
        const auth = authEngine.authorizeExecution({});
        const plan = planner.generatePlan(auth);
        const result = { executionId: "exec-1", status: "Completed" } as any;
        const verification = verifier.verifyExecution(result);
        const rollbackPlan = rollbackEngine.generateRollbackPlan(verification);
        
        const context = orchestrator.assembleContext(
          {}, auth, plan, result, verification, rollbackPlan, null, []
        );
        expect(context.id).toBeDefined();
        expect(context.authorization).toBe(auth);
        expect(context.plan).toBe(plan);
      });
    }
  });

  describe('Prompt Builder AI Boundary', () => {
    for(let i=0; i<5; i++) {
      it(`should consume context and never compute [Case ${i}]`, () => {
        const auth = authEngine.authorizeExecution({});
        const plan = planner.generatePlan(auth);
        const result = { executionId: "exec-1", status: "Completed" } as any;
        const verification = verifier.verifyExecution(result);
        
        const context = orchestrator.assembleContext(
          {}, auth, plan, result, verification, null, null, []
        );
        
        const prompt = promptBuilder.buildPrompt(context);
        expect(prompt).toContain("strictly prohibited from authorizing execution");
      });
    }
  });
  
  describe('PlatformEventBus Lifecycle Ordering', () => {
    for(let i=0; i<5; i++) {
      it(`should emit all execution events in strictly correct sequence [Case ${i}]`, async () => {
        const events: string[] = [];
        const capture = (name: string) => eventBus.subscribe(name, () => events.push(name));
        
        capture("ExecutionAuthorized");
        capture("ExecutionPlanned");
        capture("ExecutionStarted");
        capture("ExecutionCompleted");
        capture("ExecutionVerified");
        capture("RollbackGenerated");
        capture("RollbackCompleted");
        capture("ExecutionContextCreated");
        
        const auth = authEngine.authorizeExecution({});
        const plan = planner.generatePlan(auth);
        const result = await executor.executePlan(plan, auth);
        const verification = verifier.verifyExecution(result);
        const rollbackPlan = rollbackEngine.generateRollbackPlan(verification);
        
        orchestrator.assembleContext(
          {}, auth, plan, result, verification, rollbackPlan, null, []
        );
        
        // Since verification is true, RollbackGenerated and RollbackCompleted are skipped
        expect(events).toEqual([
          "ExecutionAuthorized",
          "ExecutionPlanned",
          "ExecutionStarted",
          "ExecutionCompleted",
          "ExecutionVerified",
          "ExecutionContextCreated"
        ]);
      });
    }
  });
});
