import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface UIState {
  // Modal states
  isCommandPaletteOpen: boolean
  isSettingsModalOpen: boolean
  isCreateProjectModalOpen: boolean

  // Drawer states
  activeDrawer: 'agent-panel' | 'workflow-list' | 'none'

  // Layout
  sidebarCollapsed: boolean

  // Actions
  setCommandPaletteOpen: (open: boolean) => void
  setSettingsModalOpen: (open: boolean) => void
  setCreateProjectModalOpen: (open: boolean) => void
  setActiveDrawer: (drawer: UIState['activeDrawer']) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>()(
  immer((set) => ({
    // Initial state
    isCommandPaletteOpen: false,
    isSettingsModalOpen: false,
    isCreateProjectModalOpen: false,
    activeDrawer: 'none',
    sidebarCollapsed: false,

    // Actions
    setCommandPaletteOpen: (open) =>
      set((state) => {
        state.isCommandPaletteOpen = open
      }),

    setSettingsModalOpen: (open) =>
      set((state) => {
        state.isSettingsModalOpen = open
      }),

    setCreateProjectModalOpen: (open) =>
      set((state) => {
        state.isCreateProjectModalOpen = open
      }),

    setActiveDrawer: (drawer) =>
      set((state) => {
        state.activeDrawer = drawer
      }),

    toggleSidebar: () =>
      set((state) => {
        state.sidebarCollapsed = !state.sidebarCollapsed
      }),
  }))
)
