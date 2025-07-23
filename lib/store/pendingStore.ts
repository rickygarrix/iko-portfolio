import { create } from "zustand";

export type PendingStore = {
  name: string;
  genre_ids: string[]; // ジャンルは配列
  address: string;
  website_url: string;
  instagram_url: string;
};

const initialPendingStore: PendingStore = {
  name: "",
  genre_ids: [],
  address: "",
  website_url: "",
  instagram_url: "",
};

type PendingStoreState = {
  pendingStore: PendingStore;
  setPendingStore: (store: Partial<PendingStore>) => void;
  resetPendingStore: () => void;
};

export const usePendingStore = create<PendingStoreState>((set) => ({
  pendingStore: initialPendingStore,
  setPendingStore: (store) =>
    set((state) => ({
      pendingStore: { ...state.pendingStore, ...store },
    })),
  resetPendingStore: () =>
    set(() => ({
      pendingStore: initialPendingStore,
    })),
}));