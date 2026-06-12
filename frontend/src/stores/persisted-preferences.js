import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const usePersistedPreferences = create(
  persist(
    (set) => ({
      theme: 'light',
      fontSize: 'base',
      fontFamily: 'poppins',
      language: 'en',
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
      })),
      setFontSize: (fontSize) => set({ fontSize }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setLanguage: (language) => set({ language }),
      reset: () => set({
        theme: 'light',
        fontSize: 'base',
        fontFamily: 'poppins',
        language: 'en'
      })
    }),
    {
      name: 'preferences',
      version: 2,
      migrate: (persisted, version) => {
        if (version === 0) {
          return { ...persisted, fontSize: 'base', fontFamily: 'poppins' }
        }
        return persisted
      }
    }
  )
)
