import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const usePersistedAuth = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      expiresAt: null,
      login: (user, token) => set({
        user,
        token,
        expiresAt: Date.now() + 86400000
      }),
      logout: () => set({
        user: null,
        token: null,
        expiresAt: null
      }),
      isExpired: () => {
        const state = usePersistedAuth.getState()
        return state.expiresAt && Date.now() > state.expiresAt
      }
    }),
    {
      name: 'auth-persist',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        expiresAt: state.expiresAt
      })
    }
  )
)
