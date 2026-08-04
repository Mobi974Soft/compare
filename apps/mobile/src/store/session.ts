import { create } from 'zustand';

interface PendingAction { path: string; label: string }
interface SessionState {
  isGuest: boolean;
  alias: string | null;
  pendingAction: PendingAction | null;
  setPendingAction: (action: PendingAction | null) => void;
  signInDemo: (alias: string) => void;
  signOut: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  isGuest: true,
  alias: null,
  pendingAction: null,
  setPendingAction: (pendingAction) => set({ pendingAction }),
  signInDemo: (alias) => set({ isGuest: false, alias }),
  signOut: () => set({ isGuest: true, alias: null }),
}));
