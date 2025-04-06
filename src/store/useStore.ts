import create from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  theme: 'light' | 'dark' | 'system';
  matches: any[];
  notifications: any[];
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  addMatch: (match: any) => void;
  addNotification: (notification: any) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      matches: [],
      notifications: [],
      setTheme: (theme) => set({ theme }),
      addMatch: (match) => set((state) => ({ matches: [...state.matches, match] })),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [...state.notifications, notification],
        })),
    }),
    {
      name: 'hukie-storage',
    }
  )
);