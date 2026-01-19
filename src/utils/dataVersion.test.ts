import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  DATA_VERSION,
  getLocalDataVersion,
  setLocalDataVersion,
  runMigrations,
  initializeDataVersionSystem,
  resetDataVersionSystem,
} from "./dataVersion";
import { systemKeeplists } from "../data/systemKeeplists";

const STORAGE_KEY = "arckeepers-storage";
const DATA_VERSION_KEY = "arckeepers-data-version";

describe("dataVersion", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("getLocalDataVersion", () => {
    it("returns DEFAULT_VERSION (1) when no version is stored", () => {
      expect(getLocalDataVersion()).toBe(1);
    });

    it("returns the stored version when one exists", () => {
      localStorage.setItem(DATA_VERSION_KEY, "5");
      expect(getLocalDataVersion()).toBe(5);
    });

    it("returns DEFAULT_VERSION for invalid stored values", () => {
      localStorage.setItem(DATA_VERSION_KEY, "not-a-number");
      expect(getLocalDataVersion()).toBe(1);
    });
  });

  describe("setLocalDataVersion", () => {
    it("stores the version in localStorage", () => {
      setLocalDataVersion(3);
      expect(localStorage.getItem(DATA_VERSION_KEY)).toBe("3");
    });
  });

  describe("runMigrations", () => {
    describe("for new users (no existing data)", () => {
      it("creates initial state with expedition-1 disabled", () => {
        // New user has no data
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

        // Run migrations
        runMigrations();

        // Check that state was created
        const stored = localStorage.getItem(STORAGE_KEY);
        expect(stored).not.toBeNull();

        const parsed = JSON.parse(stored!);
        const state = parsed.state || parsed;

        // expedition-1 should NOT be in activeKeeplistIds
        expect(state.settings.activeKeeplistIds).not.toContain("expedition-1");

        // But other keeplists should be active
        expect(state.settings.activeKeeplistIds).toContain("workbenches");
        expect(state.settings.activeKeeplistIds).toContain("expedition-2");
      });

      it("includes all system keeplists in the created state", () => {
        runMigrations();

        const stored = localStorage.getItem(STORAGE_KEY);
        const parsed = JSON.parse(stored!);
        const state = parsed.state || parsed;

        // All system keeplists should be present
        const keeplistIds = state.keeplists.map((kl: { id: string }) => kl.id);
        for (const systemKeeplist of systemKeeplists) {
          expect(keeplistIds).toContain(systemKeeplist.id);
        }
      });
    });

    describe("for existing users with version 1 (all keeplists active)", () => {
      beforeEach(() => {
        // Simulate existing user with version 1 and empty activeKeeplistIds (all active)
        localStorage.setItem(DATA_VERSION_KEY, "1");
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            state: {
              keeplists: systemKeeplists,
              settings: {
                showCompleted: false,
                activeKeeplistIds: [], // Empty means all active
                animationsEnabled: true,
              },
            },
            version: 0,
          })
        );
      });

      it("disables expedition-1 by setting explicit activeKeeplistIds", () => {
        runMigrations();

        const stored = localStorage.getItem(STORAGE_KEY);
        const parsed = JSON.parse(stored!);
        const state = parsed.state || parsed;

        // expedition-1 should NOT be in activeKeeplistIds
        expect(state.settings.activeKeeplistIds).not.toContain("expedition-1");

        // Other keeplists should be active
        expect(state.settings.activeKeeplistIds.length).toBeGreaterThan(0);
        expect(state.settings.activeKeeplistIds).toContain("workbenches");
      });

      it("updates data version to current version", () => {
        runMigrations();
        expect(getLocalDataVersion()).toBe(DATA_VERSION);
      });
    });

    describe("for existing users with customized active keeplists", () => {
      beforeEach(() => {
        // User had explicitly selected only certain keeplists, including expedition-1
        localStorage.setItem(DATA_VERSION_KEY, "1");
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            state: {
              keeplists: systemKeeplists,
              settings: {
                showCompleted: true,
                activeKeeplistIds: ["workbenches", "expedition-1", "expedition-2"],
                animationsEnabled: false,
              },
            },
            version: 0,
          })
        );
      });

      it("removes expedition-1 from activeKeeplistIds", () => {
        runMigrations();

        const stored = localStorage.getItem(STORAGE_KEY);
        const parsed = JSON.parse(stored!);
        const state = parsed.state || parsed;

        expect(state.settings.activeKeeplistIds).not.toContain("expedition-1");
        expect(state.settings.activeKeeplistIds).toContain("workbenches");
        expect(state.settings.activeKeeplistIds).toContain("expedition-2");
      });

      it("preserves other user settings", () => {
        runMigrations();

        const stored = localStorage.getItem(STORAGE_KEY);
        const parsed = JSON.parse(stored!);
        const state = parsed.state || parsed;

        expect(state.settings.showCompleted).toBe(true);
        expect(state.settings.animationsEnabled).toBe(false);
      });
    });

    describe("when version is already current", () => {
      it("does not modify storage", () => {
        const originalData = {
          state: {
            keeplists: systemKeeplists,
            settings: {
              showCompleted: true,
              activeKeeplistIds: ["workbenches", "expedition-1"], // User re-enabled expedition-1
              animationsEnabled: true,
            },
          },
          version: 0,
        };

        localStorage.setItem(DATA_VERSION_KEY, String(DATA_VERSION));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(originalData));

        runMigrations();

        const stored = localStorage.getItem(STORAGE_KEY);
        const parsed = JSON.parse(stored!);
        const state = parsed.state || parsed;

        // expedition-1 should still be in the list since migration didn't run
        expect(state.settings.activeKeeplistIds).toContain("expedition-1");
      });
    });
  });

  describe("initializeDataVersionSystem", () => {
    it("initializes version and runs migrations for new users", () => {
      initializeDataVersionSystem();

      // Version should be set to current
      expect(getLocalDataVersion()).toBe(DATA_VERSION);

      // State should be created with expedition-1 disabled
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      const state = parsed.state || parsed;
      expect(state.settings.activeKeeplistIds).not.toContain("expedition-1");
    });
  });

  describe("resetDataVersionSystem", () => {
    it("clears storage and re-runs migrations", () => {
      // Set up some existing state
      localStorage.setItem(DATA_VERSION_KEY, String(DATA_VERSION));
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          state: {
            keeplists: systemKeeplists,
            settings: {
              showCompleted: true,
              activeKeeplistIds: ["workbenches", "expedition-1"], // User had re-enabled expedition-1
              animationsEnabled: false,
            },
          },
        })
      );

      // Reset
      resetDataVersionSystem();

      // State should be fresh with expedition-1 disabled
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(stored!);
      const state = parsed.state || parsed;

      expect(state.settings.activeKeeplistIds).not.toContain("expedition-1");
      expect(state.settings.showCompleted).toBe(false); // Reset to default
      expect(state.settings.animationsEnabled).toBe(true); // Reset to default
    });

    it("updates version to current", () => {
      localStorage.setItem(DATA_VERSION_KEY, "1");

      resetDataVersionSystem();

      expect(getLocalDataVersion()).toBe(DATA_VERSION);
    });
  });
});
