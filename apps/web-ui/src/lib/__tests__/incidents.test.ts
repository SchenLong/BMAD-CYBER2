/**
 * Incident Types Tests
 * Story 6.6, Task 8: Testing & Verification
 */

import { describe, it, expect } from '@jest/globals';
import {
  SEVERITY_COLORS,
  PHASE_CONFIG,
  PHASE_TRANSITIONS,
  getAllowedTransitions,
  isValidTransition,
  generateIncidentId,
  formatIncidentTime,
  type IncidentSeverity,
  type IncidentPhase,
} from '../types/incidents';

describe('Incident Types', () => {
  describe('SEVERITY_COLORS', () => {
    it('should have colors for all severity levels', () => {
      expect(SEVERITY_COLORS.critical).toBeDefined();
      expect(SEVERITY_COLORS.high).toBeDefined();
      expect(SEVERITY_COLORS.medium).toBeDefined();
      expect(SEVERITY_COLORS.low).toBeDefined();
    });

    it('should have distinct colors for each severity', () => {
      const colors = Object.values(SEVERITY_COLORS);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(colors.length);
    });
  });

  describe('PHASE_CONFIG', () => {
    it('should have configuration for all phases', () => {
      const phases: IncidentPhase[] = [
        'identification',
        'containment',
        'eradication',
        'recovery',
        'closed',
      ];

      phases.forEach((phase) => {
        expect(PHASE_CONFIG[phase]).toBeDefined();
        expect(PHASE_CONFIG[phase].name).toBeDefined();
        expect(PHASE_CONFIG[phase].description).toBeDefined();
        expect(PHASE_CONFIG[phase].order).toBeDefined();
        expect(PHASE_CONFIG[phase].color).toBeDefined();
      });
    });

    it('should have phases in correct order', () => {
      expect(PHASE_CONFIG.identification.order).toBe(1);
      expect(PHASE_CONFIG.containment.order).toBe(2);
      expect(PHASE_CONFIG.eradication.order).toBe(3);
      expect(PHASE_CONFIG.recovery.order).toBe(4);
      expect(PHASE_CONFIG.closed.order).toBe(5);
    });
  });

  describe('PHASE_TRANSITIONS', () => {
    it('should define transitions for all phases except closed', () => {
      const phaseKeys = Object.keys(PHASE_CONFIG) as IncidentPhase[];

      phaseKeys.forEach((phase) => {
        if (phase === 'closed') {
          const closedTransition = PHASE_TRANSITIONS.find(
            (t) => t.from === 'closed'
          );
          expect(closedTransition?.allowedTransitions).toEqual([]);
        } else {
          const transition = PHASE_TRANSITIONS.find((t) => t.from === phase);
          expect(transition).toBeDefined();
          expect(transition?.allowedTransitions.length).toBeGreaterThan(0);
        }
      });
    });
  });
});

describe('Transition Validation', () => {
  describe('getAllowedTransitions', () => {
    it('should return correct allowed transitions for identification', () => {
      const allowed = getAllowedTransitions('identification');
      expect(allowed).toContain('containment');
      expect(allowed).toContain('closed');
      expect(allowed).not.toContain('identification');
      expect(allowed).not.toContain('eradication');
      expect(allowed).not.toContain('recovery');
    });

    it('should return correct allowed transitions for containment', () => {
      const allowed = getAllowedTransitions('containment');
      expect(allowed).toContain('eradication');
      expect(allowed).toContain('identification');
      expect(allowed).toContain('closed');
      expect(allowed).not.toContain('containment');
      expect(allowed).not.toContain('recovery');
    });

    it('should return correct allowed transitions for eradication', () => {
      const allowed = getAllowedTransitions('eradication');
      expect(allowed).toContain('recovery');
      expect(allowed).toContain('containment');
      expect(allowed).toContain('closed');
      expect(allowed).not.toContain('eradication');
      expect(allowed).not.toContain('identification');
    });

    it('should return correct allowed transitions for recovery', () => {
      const allowed = getAllowedTransitions('recovery');
      expect(allowed).toContain('closed');
      expect(allowed).toContain('eradication');
      expect(allowed).not.toContain('recovery');
      expect(allowed).not.toContain('containment');
      expect(allowed).not.toContain('identification');
    });

    it('should return empty array for closed phase', () => {
      const allowed = getAllowedTransitions('closed');
      expect(allowed).toEqual([]);
    });
  });

  describe('isValidTransition', () => {
    it('should validate valid forward transitions', () => {
      expect(isValidTransition('identification', 'containment')).toBe(true);
      expect(isValidTransition('containment', 'eradication')).toBe(true);
      expect(isValidTransition('eradication', 'recovery')).toBe(true);
      expect(isValidTransition('recovery', 'closed')).toBe(true);
    });

    it('should validate backward transitions', () => {
      expect(isValidTransition('containment', 'identification')).toBe(true);
      expect(isValidTransition('eradication', 'containment')).toBe(true);
      expect(isValidTransition('recovery', 'eradication')).toBe(true);
    });

    it('should invalidate invalid transitions', () => {
      expect(isValidTransition('identification', 'eradication')).toBe(false);
      expect(isValidTransition('identification', 'recovery')).toBe(false);
      expect(isValidTransition('containment', 'recovery')).toBe(false);
      expect(isValidTransition('closed', 'containment')).toBe(false);
    });

    it('should invalidate self-transitions', () => {
      expect(isValidTransition('identification', 'identification')).toBe(false);
      expect(isValidTransition('containment', 'containment')).toBe(false);
      expect(isValidTransition('eradication', 'eradication')).toBe(false);
      expect(isValidTransition('recovery', 'recovery')).toBe(false);
      expect(isValidTransition('closed', 'closed')).toBe(false);
    });
  });
});

describe('Utility Functions', () => {
  describe('generateIncidentId', () => {
    it('should generate incident ID in correct format', () => {
      const id = generateIncidentId();
      expect(id).toMatch(/^INC-\d{4}-\d{3}$/);
    });

    it('should include current year', () => {
      const id = generateIncidentId();
      const currentYear = new Date().getFullYear();
      expect(id).toContain(`INC-${currentYear}-`);
    });

    it('should generate different IDs on multiple calls', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateIncidentId());
      }
      // With random 000-999, we should get at least 85 unique IDs in 100 tries
      // (allowing for random collisions - theoretical minimum is ~63 due to birthday paradox)
      expect(ids.size).toBeGreaterThan(85);
    });
  });

  describe('formatIncidentTime', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2026-02-17T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should format time as "Just now" for less than a minute', () => {
      const time = new Date('2026-02-17T11:59:30Z');
      expect(formatIncidentTime(time)).toBe('Just now');
    });

    it('should format time as "Xm ago" for less than an hour', () => {
      const time = new Date('2026-02-17T11:30:00Z');
      expect(formatIncidentTime(time)).toBe('30m ago');
    });

    it('should format time as "Xh ago" for less than a day', () => {
      const time = new Date('2026-02-17T08:00:00Z');
      expect(formatIncidentTime(time)).toBe('4h ago');
    });

    it('should format time as "Xd ago" for less than a week', () => {
      const time = new Date('2026-02-14T12:00:00Z');
      expect(formatIncidentTime(time)).toBe('3d ago');
    });

    it('should format as date for older times', () => {
      const time = new Date('2026-01-01T12:00:00Z');
      expect(formatIncidentTime(time)).toBe('1/1/2026');
    });
  });
});
