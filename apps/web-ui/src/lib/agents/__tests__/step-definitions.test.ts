/**
 * Tests for Step Definitions
 */

import {
  INTEL_AGENT_STEPS,
  SECURITY_AGENT_STEPS,
  IR_AGENT_STEPS,
  LEGAL_AGENT_STEPS,
  STRATEGY_AGENT_STEPS,
  BMM_AGENT_STEPS,
  BMGD_AGENT_STEPS,
  GENERIC_AGENT_STEPS,
  getStepsForAgentType,
  getStepById,
  getStepIndex,
} from '../step-definitions';
import type { AgentStep } from '@/types/events';

describe('Step Definitions', () => {
  describe('INTEL_AGENT_STEPS', () => {
    it('should have all required steps', () => {
      expect(INTEL_AGENT_STEPS).toHaveLength(6);

      const stepIds = INTEL_AGENT_STEPS.map(s => s.id);
      expect(stepIds).toContain('init');
      expect(stepIds).toContain('osint');
      expect(stepIds).toContain('dns');
      expect(stepIds).toContain('subdomains');
      expect(stepIds).toContain('analysis');
      expect(stepIds).toContain('report');
    });

    it('should have weights that sum to 100', () => {
      const totalWeight = INTEL_AGENT_STEPS.reduce((sum, step) => sum + step.weight, 0);
      expect(totalWeight).toBe(100);
    });

    it('should have human-readable step names', () => {
      INTEL_AGENT_STEPS.forEach(step => {
        expect(step.name).toBeTruthy();
        expect(step.name.length).toBeGreaterThan(0);
        expect(step.name.length).toBeLessThan(100);
      });
    });
  });

  describe('SECURITY_AGENT_STEPS', () => {
    it('should have all required steps', () => {
      expect(SECURITY_AGENT_STEPS).toHaveLength(5);

      const stepIds = SECURITY_AGENT_STEPS.map(s => s.id);
      expect(stepIds).toContain('init');
      expect(stepIds).toContain('recon');
      expect(stepIds).toContain('scan');
      expect(stepIds).toContain('analysis');
      expect(stepIds).toContain('report');
    });

    it('should have weights that sum to 100', () => {
      const totalWeight = SECURITY_AGENT_STEPS.reduce((sum, step) => sum + step.weight, 0);
      expect(totalWeight).toBe(100);
    });
  });

  describe('IR_AGENT_STEPS', () => {
    it('should have all required steps', () => {
      expect(IR_AGENT_STEPS).toHaveLength(5);

      const stepIds = IR_AGENT_STEPS.map(s => s.id);
      expect(stepIds).toContain('triage');
      expect(stepIds).toContain('containment');
      expect(stepIds).toContain('investigation');
      expect(stepIds).toContain('eradication');
      expect(stepIds).toContain('recovery');
    });

    it('should have weights that sum to 100', () => {
      const totalWeight = IR_AGENT_STEPS.reduce((sum, step) => sum + step.weight, 0);
      expect(totalWeight).toBe(100);
    });
  });

  describe('LEGAL_AGENT_STEPS', () => {
    it('should have all required steps', () => {
      expect(LEGAL_AGENT_STEPS).toHaveLength(5);

      const stepIds = LEGAL_AGENT_STEPS.map(s => s.id);
      expect(stepIds).toContain('init');
      expect(stepIds).toContain('research');
      expect(stepIds).toContain('analysis');
      expect(stepIds).toContain('drafting');
      expect(stepIds).toContain('review');
    });

    it('should have weights that sum to 100', () => {
      const totalWeight = LEGAL_AGENT_STEPS.reduce((sum, step) => sum + step.weight, 0);
      expect(totalWeight).toBe(100);
    });
  });

  describe('STRATEGY_AGENT_STEPS', () => {
    it('should have all required steps', () => {
      expect(STRATEGY_AGENT_STEPS).toHaveLength(5);

      const stepIds = STRATEGY_AGENT_STEPS.map(s => s.id);
      expect(stepIds).toContain('init');
      expect(stepIds).toContain('assessment');
      expect(stepIds).toContain('options');
      expect(stepIds).toContain('analysis');
      expect(stepIds).toContain('recommendations');
    });

    it('should have weights that sum to 100', () => {
      const totalWeight = STRATEGY_AGENT_STEPS.reduce((sum, step) => sum + step.weight, 0);
      expect(totalWeight).toBe(100);
    });
  });

  describe('BMM_AGENT_STEPS', () => {
    it('should have all required steps', () => {
      expect(BMM_AGENT_STEPS).toHaveLength(5);

      const stepIds = BMM_AGENT_STEPS.map(s => s.id);
      expect(stepIds).toContain('init');
      expect(stepIds).toContain('requirements');
      expect(stepIds).toContain('design');
      expect(stepIds).toContain('implementation');
      expect(stepIds).toContain('validation');
    });

    it('should have weights that sum to 100', () => {
      const totalWeight = BMM_AGENT_STEPS.reduce((sum, step) => sum + step.weight, 0);
      expect(totalWeight).toBe(100);
    });
  });

  describe('BMGD_AGENT_STEPS', () => {
    it('should have all required steps', () => {
      expect(BMGD_AGENT_STEPS).toHaveLength(5);

      const stepIds = BMGD_AGENT_STEPS.map(s => s.id);
      expect(stepIds).toContain('init');
      expect(stepIds).toContain('mechanics');
      expect(stepIds).toContain('design');
      expect(stepIds).toContain('balancing');
      expect(stepIds).toContain('documentation');
    });

    it('should have weights that sum to 100', () => {
      const totalWeight = BMGD_AGENT_STEPS.reduce((sum, step) => sum + step.weight, 0);
      expect(totalWeight).toBe(100);
    });
  });

  describe('GENERIC_AGENT_STEPS', () => {
    it('should have basic steps', () => {
      expect(GENERIC_AGENT_STEPS.length).toBeGreaterThan(0);
    });

    it('should have weights that sum to 100', () => {
      const totalWeight = GENERIC_AGENT_STEPS.reduce((sum, step) => sum + step.weight, 0);
      expect(totalWeight).toBe(100);
    });
  });
});

describe('getStepsForAgentType', () => {
  it('should return INTEL_AGENT_STEPS for intel agent', () => {
    const steps = getStepsForAgentType('intel');
    expect(steps).toEqual(INTEL_AGENT_STEPS);
  });

  it('should return INTEL_AGENT_STEPS for osint-lead agent', () => {
    const steps = getStepsForAgentType('osint-lead');
    expect(steps).toEqual(INTEL_AGENT_STEPS);
  });

  it('should return SECURITY_AGENT_STEPS for security agent', () => {
    const steps = getStepsForAgentType('security');
    expect(steps).toEqual(SECURITY_AGENT_STEPS);
  });

  it('should return SECURITY_AGENT_STEPS for threat-analyst agent', () => {
    const steps = getStepsForAgentType('threat-analyst');
    expect(steps).toEqual(SECURITY_AGENT_STEPS);
  });

  it('should return SECURITY_AGENT_STEPS for penetration-tester agent', () => {
    const steps = getStepsForAgentType('penetration-tester');
    expect(steps).toEqual(SECURITY_AGENT_STEPS);
  });

  it('should return IR_AGENT_STEPS for IR agent', () => {
    const steps = getStepsForAgentType('ir');
    expect(steps).toEqual(IR_AGENT_STEPS);
  });

  it('should return IR_AGENT_STEPS for incident-commander agent', () => {
    const steps = getStepsForAgentType('incident-commander');
    expect(steps).toEqual(IR_AGENT_STEPS);
  });

  it('should return LEGAL_AGENT_STEPS for legal agent', () => {
    const steps = getStepsForAgentType('legal');
    expect(steps).toEqual(LEGAL_AGENT_STEPS);
  });

  it('should return LEGAL_AGENT_STEPS for liberty agent', () => {
    const steps = getStepsForAgentType('liberty');
    expect(steps).toEqual(LEGAL_AGENT_STEPS);
  });

  it('should return STRATEGY_AGENT_STEPS for strategy agent', () => {
    const steps = getStepsForAgentType('strategy');
    expect(steps).toEqual(STRATEGY_AGENT_STEPS);
  });

  it('should return STRATEGY_AGENT_STEPS for stakeholder-mediator agent', () => {
    const steps = getStepsForAgentType('stakeholder-mediator');
    expect(steps).toEqual(STRATEGY_AGENT_STEPS);
  });

  it('should return BMM_AGENT_STEPS for bmm agent', () => {
    const steps = getStepsForAgentType('bmm');
    expect(steps).toEqual(BMM_AGENT_STEPS);
  });

  it('should return BMM_AGENT_STEPS for architect agent', () => {
    const steps = getStepsForAgentType('architect');
    expect(steps).toEqual(BMM_AGENT_STEPS);
  });

  it('should return BMGD_AGENT_STEPS for bmgd agent', () => {
    const steps = getStepsForAgentType('bmgd');
    expect(steps).toEqual(BMGD_AGENT_STEPS);
  });

  it('should return BMGD_AGENT_STEPS for game-architect agent', () => {
    const steps = getStepsForAgentType('game-architect');
    expect(steps).toEqual(BMGD_AGENT_STEPS);
  });

  it('should return GENERIC_AGENT_STEPS for unknown agent type', () => {
    const steps = getStepsForAgentType('unknown-agent-type');
    expect(steps).toEqual(GENERIC_AGENT_STEPS);
  });

  it('should be case insensitive', () => {
    const steps1 = getStepsForAgentType('Intel');
    const steps2 = getStepsForAgentType('INTEL');
    const steps3 = getStepsForAgentType('intel');

    expect(steps1).toEqual(INTEL_AGENT_STEPS);
    expect(steps2).toEqual(INTEL_AGENT_STEPS);
    expect(steps3).toEqual(INTEL_AGENT_STEPS);
  });
});

describe('getStepById', () => {
  const steps: readonly AgentStep[] = [
    { id: 'step1', name: 'Step 1', weight: 10 },
    { id: 'step2', name: 'Step 2', weight: 20 },
    { id: 'step3', name: 'Step 3', weight: 30 },
  ] as const;

  it('should return step by id', () => {
    const step = getStepById(steps, 'step2');
    expect(step).toEqual(steps[1]);
  });

  it('should return undefined for unknown id', () => {
    const step = getStepById(steps, 'unknown');
    expect(step).toBeUndefined();
  });
});

describe('getStepIndex', () => {
  const steps: readonly AgentStep[] = [
    { id: 'step1', name: 'Step 1', weight: 10 },
    { id: 'step2', name: 'Step 2', weight: 20 },
    { id: 'step3', name: 'Step 3', weight: 30 },
  ] as const;

  it('should return index of step', () => {
    const index = getStepIndex(steps, 'step2');
    expect(index).toBe(1);
  });

  it('should return -1 for unknown id', () => {
    const index = getStepIndex(steps, 'unknown');
    expect(index).toBe(-1);
  });
});
