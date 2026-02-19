import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface Mission {
  id: string
  title: string
  description?: string
  status: 'idle' | 'running' | 'completed' | 'failed'
  agents: string[]
  output: string[]
  createdAt?: Date
  updatedAt?: Date
}

interface MissionState {
  // Data
  missions: Mission[]
  activeMission: Mission | null
  isExecuting: boolean

  // Actions
  setActiveMission: (id: string | null) => void
  addMission: (mission: Mission) => void
  updateMissionStatus: (id: string, status: Mission['status']) => void
  appendOutput: (missionId: string, line: string) => void
  clearActiveMission: () => void
  setExecuting: (executing: boolean) => void
}

export const useMissionStore = create<MissionState>()(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  immer((set, _get) => ({
    // Initial state
    missions: [],
    activeMission: null,
    isExecuting: false,

    // Actions
    setActiveMission: (id) =>
      set((state) => {
        state.activeMission =
          state.missions.find((m) => m.id === id) || null
      }),

    addMission: (mission) =>
      set((state) => {
        state.missions.push(mission)
      }),

    updateMissionStatus: (id, status) =>
      set((state) => {
        const mission = state.missions.find((m) => m.id === id)
        if (mission) {
          mission.status = status
          mission.updatedAt = new Date()
        }
      }),

    appendOutput: (missionId, line) =>
      set((state) => {
        const mission = state.missions.find((m) => m.id === missionId)
        if (mission) {
          mission.output.push(line)
        }
      }),

    clearActiveMission: () =>
      set((state) => {
        state.activeMission = null
        state.isExecuting = false
      }),

    setExecuting: (executing) =>
      set((state) => {
        state.isExecuting = executing
      }),
  }))
)
