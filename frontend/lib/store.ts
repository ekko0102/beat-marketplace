import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  beatId: string;
  licenseId: string;
  beatTitle: string;
  producerName: string;
  coverUrl: string | null;
  licenseType: string;
  price: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (beatId: string, licenseId: string) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const exists = state.items.find(
            (i) => i.beatId === item.beatId && i.licenseId === item.licenseId
          );
          if (exists) return state;
          return { items: [...state.items, item] };
        }),
      removeItem: (beatId, licenseId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.beatId === beatId && i.licenseId === licenseId)
          ),
        })),
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price, 0),
    }),
    { name: 'beat-cart' }
  )
);

export interface PlayerTrack {
  id: string;
  title: string;
  producerName: string;
  coverUrl: string | null;
  previewUrl: string;
  genre?: string;
  bpm?: number;
}

interface PlayerStore {
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
  queue: PlayerTrack[];
  play: (track: PlayerTrack) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

export const usePlayerStore = create<PlayerStore>()((set) => ({
  currentTrack: null,
  isPlaying: false,
  queue: [],
  play: (track) => set({ currentTrack: track, isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  stop: () => set({ currentTrack: null, isPlaying: false }),
}));
