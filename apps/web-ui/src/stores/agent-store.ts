/**
 * Agent Store - Team and Agent Selection State Management
 * Story 2.4: Progressive Disclosure - Layer 3
 *
 * Manages team/agent selection, user preferences, and Layer 3 state
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { TeamId, AgentUserPreferences, Agent, Team } from '@/lib/types/agents';

/**
 * Agent store state and actions
 */
interface AgentState {
  // Current selection
  selectedTeam: TeamId | null;
  selectedAgent: Agent | null;

  // User preferences (Story 2.4, Task 6)
  preferences: AgentUserPreferences;

  // UI state
  isAdvancedMode: boolean;
  showTeamSelection: boolean;
  showAgentRoster: boolean;

  // Search/filter state
  searchQuery: string;
  filterExpertise: string | null;

  // Actions - Selection
  selectTeam: (teamId: TeamId) => void;
  selectAgent: (agent: Agent) => void;
  clearSelection: () => void;

  // Actions - Navigation
  showTeams: () => void;
  showRoster: (teamId: TeamId) => void;
  hideAll: () => void;

  // Actions - Preferences
  toggleAdvancedMode: () => void;
  setAdvancedMode: (enabled: boolean) => void;
  incrementDirectSelection: () => void;
  addFavoriteTeam: (teamId: TeamId) => void;
  addFavoriteAgent: (agentId: string) => void;
  setKnowsWhatTheyNeed: (value: boolean) => void;

  // Actions - Search/Filter
  setSearchQuery: (query: string) => void;
  setFilterExpertise: (expertise: string | null) => void;
  clearFilters: () => void;

  // Actions - Utility
  shouldShowLayer3Shortcut: () => boolean;
}

/**
 * Default user preferences
 */
const defaultPreferences: AgentUserPreferences = {
  advancedModeEnabled: false,
  directSelectionCount: 0,
  favoriteTeams: [],
  favoriteAgents: [],
  knowsWhatTheyNeed: false
};

export const useAgentStore = create<AgentState>()(
  immer((set, get) => ({
    // Initial state
    selectedTeam: null,
    selectedAgent: null,
    preferences: defaultPreferences,
    isAdvancedMode: false,
    showTeamSelection: false,
    showAgentRoster: false,
    searchQuery: '',
    filterExpertise: null,

    // Selection actions
    selectTeam: (teamId) => {
      set((state) => {
        state.selectedTeam = teamId;
        state.preferences.lastSelectedTeam = teamId;
        state.showAgentRoster = true;
        state.showTeamSelection = false;
      });
    },

    selectAgent: (agent) => {
      set((state) => {
        state.selectedAgent = agent;
        state.preferences.lastSelectedAgent = agent.id;
      });
    },

    clearSelection: () => {
      set((state) => {
        state.selectedTeam = null;
        state.selectedAgent = null;
      });
    },

    // Navigation actions
    showTeams: () => {
      set((state) => {
        state.showTeamSelection = true;
        state.showAgentRoster = false;
      });
    },

    showRoster: (teamId) => {
      set((state) => {
        state.selectedTeam = teamId;
        state.showAgentRoster = true;
        state.showTeamSelection = false;
      });
    },

    hideAll: () => {
      set((state) => {
        state.showTeamSelection = false;
        state.showAgentRoster = false;
      });
    },

    // Preferences actions
    toggleAdvancedMode: () => {
      set((state) => {
        state.isAdvancedMode = !state.isAdvancedMode;
        state.preferences.advancedModeEnabled = state.isAdvancedMode;
      });
    },

    setAdvancedMode: (enabled) => {
      set((state) => {
        state.isAdvancedMode = enabled;
        state.preferences.advancedModeEnabled = enabled;
      });
    },

    incrementDirectSelection: () => {
      set((state) => {
        state.preferences.directSelectionCount += 1;
        if (state.preferences.directSelectionCount >= 3 && !state.preferences.knowsWhatTheyNeed) {
          state.preferences.knowsWhatTheyNeed = true;
        }
      });
    },

    addFavoriteTeam: (teamId) => {
      set((state) => {
        if (!state.preferences.favoriteTeams.includes(teamId)) {
          state.preferences.favoriteTeams.push(teamId);
        }
      });
    },

    addFavoriteAgent: (agentId) => {
      set((state) => {
        if (!state.preferences.favoriteAgents.includes(agentId)) {
          state.preferences.favoriteAgents.push(agentId);
        }
      });
    },

    setKnowsWhatTheyNeed: (value) => {
      set((state) => {
        state.preferences.knowsWhatTheyNeed = value;
      });
    },

    // Search/Filter actions
    setSearchQuery: (query) => {
      set((state) => {
        state.searchQuery = query;
      });
    },

    setFilterExpertise: (expertise) => {
      set((state) => {
        state.filterExpertise = expertise;
      });
    },

    clearFilters: () => {
      set((state) => {
        state.searchQuery = '';
        state.filterExpertise = null;
      });
    },

    // Utility actions
    shouldShowLayer3Shortcut: () => {
      return get().preferences.directSelectionCount >= 3 || get().preferences.knowsWhatTheyNeed;
    }
  }))
);

/**
 * Hook to get agent selection preferences
 */
export function useAgentPreferences() {
  return useAgentStore((state) => state.preferences);
}

/**
 * Hook to get current selection state
 */
export function useAgentSelection() {
  return useAgentStore((state) => ({
    selectedTeam: state.selectedTeam,
    selectedAgent: state.selectedAgent,
    selectTeam: state.selectTeam,
    selectAgent: state.selectAgent,
    clearSelection: state.clearSelection
  }));
}

/**
 * Hook to get favorite teams
 */
export function useFavoriteTeams() {
  return useAgentStore((state) => state.preferences.favoriteTeams);
}
