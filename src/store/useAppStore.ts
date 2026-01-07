import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Keeplist, KeeplistItem, AppSettings } from "../types";
import { systemKeeplists } from "../data/systemKeeplists";

interface AppStore {
  // State
  keeplists: Keeplist[];
  settings: AppSettings;

  // Item quantity actions
  updateItemQty: (keeplistId: string, itemId: string, delta: number) => void;
  setItemQty: (keeplistId: string, itemId: string, qty: number) => void;
  completeItem: (keeplistId: string, itemId: string) => void;

  // User keeplist management
  createUserKeeplist: (name: string) => string | null;
  updateUserKeeplist: (keeplistId: string, name: string) => void;
  deleteUserKeeplist: (keeplistId: string) => void;
  addItemToKeeplist: (keeplistId: string, itemId: string, qtyRequired: number) => void;
  removeItemFromKeeplist: (keeplistId: string, itemId: string) => void;
  updateKeeplistItemQty: (keeplistId: string, itemId: string, qtyRequired: number) => void;

  // Active keeplist management
  toggleKeeplistActive: (keeplistId: string) => void;
  setKeeplistActive: (keeplistId: string, active: boolean) => void;

  // Settings
  setShowCompleted: (show: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;

  // Import/Export
  exportData: () => string;
  importData: (jsonString: string) => boolean;
  resetToDefaults: () => void;
}

const defaultSettings: AppSettings = {
  showCompleted: false,
  activeKeeplistIds: [], // Empty means all are active
  animationsEnabled: true, // Fade animations on by default
};

// Helper to create a slug from a name
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

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

      // Toggle animations setting
      setAnimationsEnabled: (enabled) => {
        set((state) => ({
          settings: { ...state.settings, animationsEnabled: enabled },
        }));
      },

      // Create a new user keeplist
      createUserKeeplist: (name) => {
        const id = slugify(name);
        const state = get();
        
        // Check for duplicate
        if (state.keeplists.some((kl) => kl.id === id)) {
          return null;
        }

        const newKeeplist: Keeplist = {
          id,
          name: name.trim(),
          isSystem: false,
          items: [],
        };

        set((state) => ({
          keeplists: [...state.keeplists, newKeeplist],
          // Auto-activate new keeplist
          settings: {
            ...state.settings,
            activeKeeplistIds: state.settings.activeKeeplistIds.length === 0
              ? [] // If all were active, keep all active
              : [...state.settings.activeKeeplistIds, id],
          },
        }));

        return id;
      },

      // Update user keeplist name
      updateUserKeeplist: (keeplistId, name) => {
        set((state) => ({
          keeplists: state.keeplists.map((kl) =>
            kl.id === keeplistId && !kl.isSystem
              ? { ...kl, name: name.trim() }
              : kl
          ),
        }));
      },

      // Delete user keeplist
      deleteUserKeeplist: (keeplistId) => {
        set((state) => ({
          keeplists: state.keeplists.filter(
            (kl) => kl.id !== keeplistId || kl.isSystem
          ),
          settings: {
            ...state.settings,
            activeKeeplistIds: state.settings.activeKeeplistIds.filter(
              (id) => id !== keeplistId
            ),
          },
        }));
      },

      // Add item to a user keeplist
      addItemToKeeplist: (keeplistId, itemId, qtyRequired) => {
        set((state) => ({
          keeplists: state.keeplists.map((kl) => {
            if (kl.id !== keeplistId || kl.isSystem) return kl;
            if (kl.items.some((item) => item.itemId === itemId)) return kl;
            return {
              ...kl,
              items: [
                ...kl.items,
                { itemId, qtyOwned: 0, qtyRequired, isCompleted: false },
              ],
            };
          }),
        }));
      },

      // Remove item from a user keeplist
      removeItemFromKeeplist: (keeplistId, itemId) => {
        set((state) => ({
          keeplists: state.keeplists.map((kl) => {
            if (kl.id !== keeplistId || kl.isSystem) return kl;
            return {
              ...kl,
              items: kl.items.filter((item) => item.itemId !== itemId),
            };
          }),
        }));
      },

      // Update required quantity for an item in a user keeplist
      // Note: qtyRequired=0 means "infinite demand" (never completes)
      updateKeeplistItemQty: (keeplistId, itemId, qtyRequired) => {
        set((state) => ({
          keeplists: state.keeplists.map((kl) => {
            if (kl.id !== keeplistId || kl.isSystem) return kl;
            return {
              ...kl,
              items: kl.items.map((item) =>
                item.itemId === itemId
                  ? {
                      ...item,
                      qtyRequired: Math.max(0, qtyRequired),
                      // qtyRequired=0 means infinite demand, never complete
                      isCompleted: qtyRequired > 0 && item.qtyOwned >= qtyRequired,
                    }
                  : item
              ),
            };
          }),
        }));
      },

      // Toggle a keeplist's active state
      toggleKeeplistActive: (keeplistId) => {
        set((state) => {
          const allIds = state.keeplists.map((kl) => kl.id);
          let activeIds = state.settings.activeKeeplistIds;
          
          // If empty (all active), initialize with all IDs
          if (activeIds.length === 0) {
            activeIds = allIds;
          }

          const isActive = activeIds.includes(keeplistId);
          const newActiveIds = isActive
            ? activeIds.filter((id) => id !== keeplistId)
            : [...activeIds, keeplistId];

          // If all are now active, reset to empty (meaning all)
          const allActive = allIds.every((id) => newActiveIds.includes(id));

          return {
            settings: {
              ...state.settings,
              activeKeeplistIds: allActive ? [] : newActiveIds,
            },
          };
        });
      },

      // Set a keeplist's active state explicitly
      setKeeplistActive: (keeplistId, active) => {
        set((state) => {
          const allIds = state.keeplists.map((kl) => kl.id);
          let activeIds = state.settings.activeKeeplistIds;
          
          if (activeIds.length === 0) {
            activeIds = allIds;
          }

          const newActiveIds = active
            ? activeIds.includes(keeplistId) ? activeIds : [...activeIds, keeplistId]
            : activeIds.filter((id) => id !== keeplistId);

          const allActive = allIds.every((id) => newActiveIds.includes(id));

          return {
            settings: {
              ...state.settings,
              activeKeeplistIds: allActive ? [] : newActiveIds,
            },
          };
        });
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

      // Reset to default system keeplists (keeps user keeplists)
      resetToDefaults: () => {
        set((state) => ({
          keeplists: [
            ...systemKeeplists,
            ...state.keeplists.filter((kl) => !kl.isSystem),
          ],
          settings: defaultSettings,
        }));
      },
    }),
    {
      name: "arckeepers-storage",
      // Custom merge to handle system keeplist updates
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AppStore> | undefined;
        const mergedKeeplists = mergeKeeplists(persisted?.keeplists, systemKeeplists);
        
        // Merge settings, ensuring activeKeeplistIds only contains valid IDs
        const persistedSettings = persisted?.settings ?? defaultSettings;
        const validKeeplistIds = new Set(mergedKeeplists.map((kl) => kl.id));
        
        // Find IDs of system keeplists that existed in persisted state
        const persistedSystemIds = new Set(
          (persisted?.keeplists || [])
            .filter((kl) => kl.isSystem)
            .map((kl) => kl.id)
        );
        
        // Find new system keeplists (in canonical but not in persisted)
        const newSystemKeeplistIds = systemKeeplists
          .filter((kl) => !persistedSystemIds.has(kl.id))
          .map((kl) => kl.id);

        // Filter out invalid IDs from persisted activeKeeplistIds
        let validActiveIds = (persistedSettings.activeKeeplistIds || []).filter(
          (id) => validKeeplistIds.has(id)
        );

        // Auto-enable new system keeplists
        // If user has customized their active list (not empty), add new system keeplists
        if (validActiveIds.length > 0 && newSystemKeeplistIds.length > 0) {
          validActiveIds = [...validActiveIds, ...newSystemKeeplistIds];
        }
        // If validActiveIds is empty (meaning all were active), new keeplists are auto-included

        return {
          ...currentState,
          settings: {
            ...defaultSettings,  // Ensure defaults for any new settings
            ...persistedSettings,
            activeKeeplistIds: validActiveIds,
          },
          keeplists: mergedKeeplists,
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

// Get active keeplists only
export const useActiveKeeplists = () =>
  useAppStore((state) => {
    const { keeplists, settings } = state;
    if (settings.activeKeeplistIds.length === 0) {
      return keeplists; // All are active
    }
    return keeplists.filter((kl) => settings.activeKeeplistIds.includes(kl.id));
  });

// Check if a specific keeplist is active
export const useIsKeeplistActive = (keeplistId: string) =>
  useAppStore((state) => {
    if (state.settings.activeKeeplistIds.length === 0) {
      return true; // All are active
    }
    return state.settings.activeKeeplistIds.includes(keeplistId);
  });

// Get user keeplists only
export const useUserKeeplists = () =>
  useAppStore((state) => state.keeplists.filter((kl) => !kl.isSystem));

// Get system keeplists only
export const useSystemKeeplists = () =>
  useAppStore((state) => state.keeplists.filter((kl) => kl.isSystem));
