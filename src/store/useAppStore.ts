import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Keeplist, AppSettings } from "../types";
import { systemKeeplists } from "../data/systemKeeplists";

interface AppStore {
  // State
  keeplists: Keeplist[];
  settings: AppSettings;

  // Actions
  updateItemQty: (
    keeplistId: string,
    itemId: string,
    delta: number
  ) => void;
  setItemQty: (
    keeplistId: string,
    itemId: string,
    qty: number
  ) => void;
  completeItem: (keeplistId: string, itemId: string) => void;
  setShowCompleted: (show: boolean) => void;
  exportData: () => string;
  importData: (jsonString: string) => boolean;
  resetToDefaults: () => void;
}

const defaultSettings: AppSettings = {
  showCompleted: false,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      keeplists: systemKeeplists,
      settings: defaultSettings,

      // Update quantity by delta (+1 or -1)
      updateItemQty: (keeplistId, itemId, delta) => {
        set((state) => ({
          keeplists: state.keeplists.map((keeplist) => {
            if (keeplist.id !== keeplistId) return keeplist;
            return {
              ...keeplist,
              items: keeplist.items.map((item) => {
                if (item.itemId !== itemId) return item;
                const newQty = Math.max(0, item.qtyOwned + delta);
                const isCompleted =
                  item.qtyRequired > 0 && newQty >= item.qtyRequired;
                return { ...item, qtyOwned: newQty, isCompleted };
              }),
            };
          }),
        }));
      },

      // Set quantity to specific value
      setItemQty: (keeplistId, itemId, qty) => {
        set((state) => ({
          keeplists: state.keeplists.map((keeplist) => {
            if (keeplist.id !== keeplistId) return keeplist;
            return {
              ...keeplist,
              items: keeplist.items.map((item) => {
                if (item.itemId !== itemId) return item;
                const newQty = Math.max(0, qty);
                const isCompleted =
                  item.qtyRequired > 0 && newQty >= item.qtyRequired;
                return { ...item, qtyOwned: newQty, isCompleted };
              }),
            };
          }),
        }));
      },

      // Mark item as complete (set owned to required)
      completeItem: (keeplistId, itemId) => {
        set((state) => ({
          keeplists: state.keeplists.map((keeplist) => {
            if (keeplist.id !== keeplistId) return keeplist;
            return {
              ...keeplist,
              items: keeplist.items.map((item) => {
                if (item.itemId !== itemId) return item;
                return {
                  ...item,
                  qtyOwned: item.qtyRequired,
                  isCompleted: true,
                };
              }),
            };
          }),
        }));
      },

      // Toggle show completed setting
      setShowCompleted: (show) => {
        set((state) => ({
          settings: { ...state.settings, showCompleted: show },
        }));
      },

      // Export state as JSON string
      exportData: () => {
        const state = get();
        return JSON.stringify(
          {
            keeplists: state.keeplists,
            settings: state.settings,
          },
          null,
          2
        );
      },

      // Import state from JSON string
      importData: (jsonString) => {
        try {
          const data = JSON.parse(jsonString);
          if (data.keeplists && Array.isArray(data.keeplists)) {
            set({
              keeplists: data.keeplists,
              settings: data.settings || defaultSettings,
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      // Reset to default system keeplists
      resetToDefaults: () => {
        set({
          keeplists: systemKeeplists,
          settings: defaultSettings,
        });
      },
    }),
    {
      name: "arckeepers-storage",
    }
  )
);

// Selector hooks for common use cases
export const useKeeplists = () => useAppStore((state) => state.keeplists);
export const useSettings = () => useAppStore((state) => state.settings);
export const useShowCompleted = () =>
  useAppStore((state) => state.settings.showCompleted);
