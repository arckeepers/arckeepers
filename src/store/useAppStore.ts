import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Keeplist, KeeplistItem, AppSettings } from "../types";
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

/**
 * Merge system keeplists from the app with persisted user progress.
 * 
 * Rules (from spec 4.1):
 * - System keeplists from the app are canonical (structure, items, qtyRequired)
 * - User's qtyOwned values are preserved from localStorage
 * - If an item was incomplete: preserve qtyOwned, update qtyRequired
 * - If an item was complete AND qtyRequired changed: set qtyOwned to new qtyRequired
 * - User-created keeplists (isSystem: false) are kept as-is
 */
function mergeKeeplists(
  persistedKeeplists: Keeplist[] | undefined,
  canonicalSystemKeeplists: Keeplist[]
): Keeplist[] {
  // Build a map of persisted keeplists for quick lookup
  const persistedMap = new Map<string, Keeplist>();
  if (persistedKeeplists) {
    for (const kl of persistedKeeplists) {
      persistedMap.set(kl.id, kl);
    }
  }

  // Start with merged system keeplists
  const mergedKeeplists: Keeplist[] = canonicalSystemKeeplists.map((canonical) => {
    const persisted = persistedMap.get(canonical.id);
    
    if (!persisted) {
      // New system keeplist, use canonical as-is
      return canonical;
    }

    // Build a map of persisted items for this keeplist
    const persistedItemsMap = new Map<string, KeeplistItem>();
    for (const item of persisted.items) {
      persistedItemsMap.set(item.itemId, item);
    }

    // Merge items: use canonical structure, preserve user progress
    const mergedItems = canonical.items.map((canonicalItem) => {
      const persistedItem = persistedItemsMap.get(canonicalItem.itemId);

      if (!persistedItem) {
        // New item in system keeplist, use canonical
        return canonicalItem;
      }

      // Check if item was previously complete
      const wasComplete = persistedItem.qtyOwned >= persistedItem.qtyRequired;
      const qtyRequiredChanged = persistedItem.qtyRequired !== canonicalItem.qtyRequired;

      let qtyOwned: number;
      if (wasComplete && qtyRequiredChanged) {
        // Was complete but requirement changed: set to new requirement
        // (assumes user already turned in the items)
        qtyOwned = canonicalItem.qtyRequired;
      } else {
        // Preserve user's progress
        qtyOwned = persistedItem.qtyOwned;
      }

      const isCompleted = canonicalItem.qtyRequired > 0 && qtyOwned >= canonicalItem.qtyRequired;

      return {
        itemId: canonicalItem.itemId,
        qtyOwned,
        qtyRequired: canonicalItem.qtyRequired,
        isCompleted,
      };
    });

    return {
      ...canonical,
      items: mergedItems,
    };
  });

  // Add any user-created keeplists (isSystem: false) from persisted state
  if (persistedKeeplists) {
    for (const kl of persistedKeeplists) {
      if (!kl.isSystem) {
        mergedKeeplists.push(kl);
      }
    }
  }

  return mergedKeeplists;
}

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
      // Custom merge to handle system keeplist updates
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AppStore> | undefined;
        
        return {
          ...currentState,
          settings: persisted?.settings ?? currentState.settings,
          keeplists: mergeKeeplists(persisted?.keeplists, systemKeeplists),
        };
      },
      // After rehydration, force a save to update localStorage with merged keeplists
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error("Failed to rehydrate storage:", error);
            return;
          }
          if (state) {
            // Force a state update to persist the merged keeplists
            // This ensures localStorage reflects the canonical system keeplists
            state.setShowCompleted(state.settings.showCompleted);
          }
        };
      },
    }
  )
);

// Selector hooks for common use cases
export const useKeeplists = () => useAppStore((state) => state.keeplists);
export const useSettings = () => useAppStore((state) => state.settings);
export const useShowCompleted = () =>
  useAppStore((state) => state.settings.showCompleted);
