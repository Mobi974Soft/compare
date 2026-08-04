import { create } from 'zustand';

interface AppState {
  recentBarcodes: string[];
  queuedContributions: number;
  addRecentBarcode: (barcode: string) => void;
  queueContribution: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  recentBarcodes: ['3017620422003'],
  queuedContributions: 0,
  addRecentBarcode: (barcode) => set((state) => ({ recentBarcodes: [barcode, ...state.recentBarcodes.filter((item) => item !== barcode)].slice(0, 10) })),
  queueContribution: () => set((state) => ({ queuedContributions: state.queuedContributions + 1 })),
}));
