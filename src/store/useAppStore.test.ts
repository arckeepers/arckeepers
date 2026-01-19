import { describe, it, expect, beforeEach, vi } from "vitest";
import { systemKeeplists } from "../data/systemKeeplists";

const STORAGE_KEY = "arckeepers-storage";

// We need to reset modules to get a fresh store instance each time
// because the store is created at module load time
async function getStore() {
  // Clear any cached modules
  vi.resetModules();
  // Import fresh store
  const module = await import("./useAppStore");
  return module.useAppStore;
}

// Helper to check if a keeplist is active (mirrors store logic)
// Empty activeKeeplistIds means all are active
function isKeeplistActive(activeIds: string[], _allIds: string[], keeplistId: string): boolean {
  if (activeIds.length === 0) {
    return true; // Empty = all active
  }
  return activeIds.includes(keeplistId);
}

describe("useAppStore", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  describe("initial state for new users", () => {
    it("has expedition-1 disabled by default", async () => {
      const useAppStore = await getStore();
      const state = useAppStore.getState();

      // activeKeeplistIds should not be empty (explicit list)
      expect(state.settings.activeKeeplistIds.length).toBeGreaterThan(0);

      // expedition-1 should NOT be in the active list
      expect(state.settings.activeKeeplistIds).not.toContain("expedition-1");
    });

    it("has other system keeplists enabled by default", async () => {
      const useAppStore = await getStore();
      const state = useAppStore.getState();

      // Other keeplists should be active
      expect(state.settings.activeKeeplistIds).toContain("workbenches");
      expect(state.settings.activeKeeplistIds).toContain("expedition-2");
    });

    it("includes all system keeplists", async () => {
      const useAppStore = await getStore();
      const state = useAppStore.getState();

      const keeplistIds = state.keeplists.map((kl) => kl.id);
      for (const systemKeeplist of systemKeeplists) {
        expect(keeplistIds).toContain(systemKeeplist.id);
      }
    });
  });

  describe("resetToDefaults", () => {
    it("resets system keeplists to default state", async () => {
      const useAppStore = await getStore();

      // Make some changes
      useAppStore.getState().setItemQty("workbenches", "rusted-tools", 5);
      expect(
        useAppStore
          .getState()
          .keeplists.find((kl) => kl.id === "workbenches")
          ?.items.find((item) => item.itemId === "rusted-tools")?.qtyOwned
      ).toBe(5);

      // Reset
      useAppStore.getState().resetToDefaults();

      // Progress should be cleared
      expect(
        useAppStore
          .getState()
          .keeplists.find((kl) => kl.id === "workbenches")
          ?.items.find((item) => item.itemId === "rusted-tools")?.qtyOwned
      ).toBe(0);
    });

    it("disables expedition-1 after reset", async () => {
      const useAppStore = await getStore();
      const allIds = useAppStore.getState().keeplists.map((kl) => kl.id);

      // Enable expedition-1
      useAppStore.getState().setKeeplistActive("expedition-1", true);
      expect(
        isKeeplistActive(
          useAppStore.getState().settings.activeKeeplistIds,
          allIds,
          "expedition-1"
        )
      ).toBe(true);

      // Reset
      useAppStore.getState().resetToDefaults();

      // expedition-1 should be disabled again
      expect(
        isKeeplistActive(
          useAppStore.getState().settings.activeKeeplistIds,
          allIds,
          "expedition-1"
        )
      ).toBe(false);
    });

    it("preserves user keeplists but clears their progress", async () => {
      const useAppStore = await getStore();

      // Create a user keeplist
      const id = useAppStore.getState().createUserKeeplist("My Test List");
      expect(id).toBe("my-test-list");

      // Add an item with some progress
      useAppStore.getState().addItemToKeeplist("my-test-list", "rusted-tools", 10);
      useAppStore.getState().setItemQty("my-test-list", "rusted-tools", 5);

      expect(
        useAppStore
          .getState()
          .keeplists.find((kl) => kl.id === "my-test-list")
          ?.items.find((item) => item.itemId === "rusted-tools")?.qtyOwned
      ).toBe(5);

      // Reset
      useAppStore.getState().resetToDefaults();

      // User keeplist should still exist
      const userKeeplist = useAppStore
        .getState()
        .keeplists.find((kl) => kl.id === "my-test-list");
      expect(userKeeplist).toBeDefined();
      expect(userKeeplist?.name).toBe("My Test List");

      // But progress should be cleared
      expect(
        userKeeplist?.items.find((item) => item.itemId === "rusted-tools")?.qtyOwned
      ).toBe(0);
    });

    it("preserves enabled/disabled state of user keeplists", async () => {
      const useAppStore = await getStore();

      // Create two user keeplists
      useAppStore.getState().createUserKeeplist("Enabled List");
      useAppStore.getState().createUserKeeplist("Disabled List");

      // Disable one of them
      useAppStore.getState().setKeeplistActive("disabled-list", false);

      // Verify initial state
      expect(useAppStore.getState().settings.activeKeeplistIds).toContain(
        "enabled-list"
      );
      expect(useAppStore.getState().settings.activeKeeplistIds).not.toContain(
        "disabled-list"
      );

      // Reset
      useAppStore.getState().resetToDefaults();

      // User keeplist enabled/disabled states should be preserved
      expect(useAppStore.getState().settings.activeKeeplistIds).toContain(
        "enabled-list"
      );
      expect(useAppStore.getState().settings.activeKeeplistIds).not.toContain(
        "disabled-list"
      );
    });
  });

  describe("toggleKeeplistActive", () => {
    it("can enable expedition-1", async () => {
      const useAppStore = await getStore();
      const allIds = useAppStore.getState().keeplists.map((kl) => kl.id);

      // Initially disabled
      expect(
        isKeeplistActive(
          useAppStore.getState().settings.activeKeeplistIds,
          allIds,
          "expedition-1"
        )
      ).toBe(false);

      // Enable it
      useAppStore.getState().toggleKeeplistActive("expedition-1");

      // Now enabled (note: if all are now enabled, activeKeeplistIds becomes [])
      expect(
        isKeeplistActive(
          useAppStore.getState().settings.activeKeeplistIds,
          allIds,
          "expedition-1"
        )
      ).toBe(true);
    });

    it("can disable a keeplist", async () => {
      const useAppStore = await getStore();
      const allIds = useAppStore.getState().keeplists.map((kl) => kl.id);

      // Initially enabled
      expect(
        isKeeplistActive(
          useAppStore.getState().settings.activeKeeplistIds,
          allIds,
          "workbenches"
        )
      ).toBe(true);

      // Disable it
      useAppStore.getState().toggleKeeplistActive("workbenches");

      // Now disabled
      expect(
        isKeeplistActive(
          useAppStore.getState().settings.activeKeeplistIds,
          allIds,
          "workbenches"
        )
      ).toBe(false);
    });
  });

  describe("state persistence", () => {
    it("persists changes to localStorage", async () => {
      const useAppStore = await getStore();

      // Make a change
      useAppStore.getState().setShowCompleted(true);

      // Wait for persist middleware
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Check localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      const state = parsed.state || parsed;
      expect(state.settings.showCompleted).toBe(true);
    });

    it("loads persisted state on reload", async () => {
      // First session - make changes
      let useAppStore = await getStore();
      useAppStore.getState().setShowCompleted(true);
      // Disable workbenches instead of enabling expedition-1, 
      // since enabling expedition-1 might normalize to [] (all active)
      useAppStore.getState().setKeeplistActive("workbenches", false);

      // Wait for persist
      await new Promise((resolve) => setTimeout(resolve, 10));

      // "Reload" - get fresh store
      vi.resetModules();
      useAppStore = await getStore();
      const allIds = useAppStore.getState().keeplists.map((kl) => kl.id);

      // State should be preserved
      expect(useAppStore.getState().settings.showCompleted).toBe(true);
      expect(
        isKeeplistActive(
          useAppStore.getState().settings.activeKeeplistIds,
          allIds,
          "workbenches"
        )
      ).toBe(false);
    });
  });
});
