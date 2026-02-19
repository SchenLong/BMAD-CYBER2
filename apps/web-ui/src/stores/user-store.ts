/**
 * User Store with Onboarding Role Support
 * Story 2.1: Role-Based Onboarding Wizard
 *
 * Extended user store with onboarding role and preferences
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { UserRoleType, ROLE_QUICK_ACTIONS } from '@/lib/types/onboarding';
import type { QuickAction } from '@/lib/types/onboarding';

interface UserPreferences {
  theme: 'dark' | 'light'
  fontSize: 'sm' | 'md' | 'lg'
  compactMode: boolean
  notificationsEnabled: boolean
}

interface UserState {
  // User data (will be populated from auth)
  userId: string | null
  userName: string | null
  userRole: string | null
  userRoles: string[]

  // Onboarding (Story 2.1)
  onboardingRole: UserRoleType | null
  onboardingCompleted: boolean

  // Preferences
  preferences: UserPreferences

  // Actions
  setUserId: (id: string | null) => void
  setUserName: (name: string | null) => void
  setUserRole: (role: string | null) => void
  setUserRoles: (roles: string[]) => void
  updatePreferences: (prefs: Partial<UserPreferences>) => void

  // Onboarding actions (Story 2.1)
  setOnboardingRole: (role: UserRoleType) => void
  setOnboardingCompleted: (completed: boolean) => void
  getQuickActions: () => QuickAction[]
}

const defaultPreferences: UserPreferences = {
  theme: 'dark',
  fontSize: 'md',
  compactMode: false,
  notificationsEnabled: true,
}

export const useUserStore = create<UserState>()(
  immer((set, get) => ({
    // Initial state
    userId: null,
    userName: null,
    userRole: null,
    userRoles: [],
    onboardingRole: null,
    onboardingCompleted: false,
    preferences: defaultPreferences,

    // Actions
    setUserId: (id) =>
      set((state) => {
        state.userId = id
      }),

    setUserName: (name) =>
      set((state) => {
        state.userName = name
      }),

    setUserRole: (role) =>
      set((state) => {
        state.userRole = role
      }),

    setUserRoles: (roles) =>
      set((state) => {
        state.userRoles = roles
      }),

    updatePreferences: (prefs) =>
      set((state) => {
        state.preferences = { ...state.preferences, ...prefs }
      }),

    // Onboarding actions (Story 2.1)
    setOnboardingRole: (role) =>
      set((state) => {
        state.onboardingRole = role
      }),

    setOnboardingCompleted: (completed) =>
      set((state) => {
        state.onboardingCompleted = completed
      }),

    getQuickActions: () => {
      const { onboardingRole } = get()
      if (!onboardingRole) return []
      return ROLE_QUICK_ACTIONS[onboardingRole] || []
    },
  }))
)
