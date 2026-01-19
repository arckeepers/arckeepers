/**
 * Data Version System
 *
 * Manages data versioning and migrations for localStorage data.
 * When the data format or key lists change, increment DATA_VERSION
 * and add a migration function to handle the upgrade.
 */

import { systemKeeplists } from "../data/systemKeeplists";

// Current application data version
// Increment this when data format changes require migrations
export const DATA_VERSION = 2;

// LocalStorage key for storing the user's data version
const DATA_VERSION_KEY = "arckeepers-data-version";

// Storage key used by Zustand persist
const STORAGE_KEY = "arckeepers-storage";

// Default version for users who don't have a version recorded
const DEFAULT_VERSION = 1;

/**
 * Get the user's current data version from localStorage
 * Returns DEFAULT_VERSION if not set
 */
export function getLocalDataVersion(): number {
  const stored = localStorage.getItem(DATA_VERSION_KEY);
  if (stored === null) {
    return DEFAULT_VERSION;
  }
  const version = parseInt(stored, 10);
  return isNaN(version) ? DEFAULT_VERSION : version;
}

/**
 * Set the user's data version in localStorage
 */
export function setLocalDataVersion(version: number): void {
  localStorage.setItem(DATA_VERSION_KEY, version.toString());
}

/**
 * Initialize data version if not set
 * This should be called on app startup
 */
export function initializeDataVersion(): void {
  // If the version key doesn't exist in localStorage, set it to the default
  if (!localStorage.getItem(DATA_VERSION_KEY)) {
    setLocalDataVersion(DEFAULT_VERSION);
  }
}

/**
 * Run migrations if needed
 * This function compares the local version with the app version
 * and runs any necessary migrations
 */
export function runMigrations(): void {
  const localVersion = getLocalDataVersion();
  const appVersion = DATA_VERSION;

  // If versions match, no migration needed
  if (localVersion === appVersion) {
    return;
  }

  // If local version is newer than app version, this shouldn't happen
  // but we'll log a warning
  if (localVersion > appVersion) {
    console.warn(
      `Local data version (${localVersion}) is newer than app version (${appVersion}). ` +
        `This may indicate a downgrade. Proceeding without migration.`
    );
    setLocalDataVersion(appVersion);
    return;
  }

  // Run migrations from localVersion to appVersion
  console.log(`Migrating data from version ${localVersion} to ${appVersion}`);

  // Migration logic will go here as versions increase
  let currentVersion = localVersion;

  if (currentVersion < 2) {
    migrateToVersion2();
    currentVersion = 2;
  }

  // Future migrations:
  // if (currentVersion < 3) {
  //   migrateToVersion3();
  //   currentVersion = 3;
  // }

  // Update local version to match app version
  setLocalDataVersion(appVersion);
}

/**
 * Migration: Version 1 -> Version 2
 * Hide the "expedition-1" keeplist by default
 */
function migrateToVersion2(): void {
  const TARGET_KEEPLIST_ID = "expedition-1";

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (!stored) {
      // New user - create initial state with expedition-1 disabled
      // Use system keeplists to determine all keeplist IDs
      const allKeeplistIds = systemKeeplists.map((kl) => kl.id);
      const activeKeeplistIds = allKeeplistIds.filter(
        (id) => id !== TARGET_KEEPLIST_ID
      );

      const initialState = {
        state: {
          keeplists: systemKeeplists,
          settings: {
            showCompleted: false,
            activeKeeplistIds,
            animationsEnabled: true,
          },
        },
        version: 0, // Zustand persist version
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
      console.log(
        `Migration to version 2 (new user): Created initial state with "${TARGET_KEEPLIST_ID}" hidden`
      );
      return;
    }

    const parsed = JSON.parse(stored);
    if (!parsed) {
      // Invalid format, skip migration
      return;
    }

    // Zustand persist stores state directly, but may wrap it in a 'state' property
    // Handle both formats
    const state = parsed.state || parsed;

    if (!state.settings) {
      // No settings, initialize with default
      state.settings = {
        showCompleted: false,
        activeKeeplistIds: [],
        animationsEnabled: true,
      };
    }

    const activeKeeplistIds: string[] = state.settings.activeKeeplistIds || [];
    const keeplists = state.keeplists || [];

    // Get all keeplist IDs
    const allKeeplistIds: string[] = keeplists.map(
      (kl: { id: string }) => kl.id
    );

    let newActiveKeeplistIds: string[];

    if (activeKeeplistIds.length === 0) {
      // All keeplists are currently active (empty array means all)
      // Set to all IDs except expedition-1
      newActiveKeeplistIds = allKeeplistIds.filter(
        (id: string) => id !== TARGET_KEEPLIST_ID
      );
    } else {
      // Some keeplists are already filtered
      // Remove expedition-1 if it's in the list
      newActiveKeeplistIds = activeKeeplistIds.filter(
        (id: string) => id !== TARGET_KEEPLIST_ID
      );
    }

    // Update the state
    state.settings.activeKeeplistIds = newActiveKeeplistIds;

    // Write back to localStorage
    // Preserve the original structure (with or without 'state' wrapper)
    if (parsed.state) {
      parsed.state = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    console.log(
      `Migration to version 2 complete: Hidden keeplist "${TARGET_KEEPLIST_ID}"`
    );
  } catch (error) {
    console.error("Error during migration to version 2:", error);
    // Don't throw - allow app to continue even if migration fails
  }
}

/**
 * Initialize the data version system
 * Call this once at app startup
 */
export function initializeDataVersionSystem(): void {
  initializeDataVersion();
  runMigrations();
}

/**
 * Reset the data version system
 * This clears the stored data and version, allowing migrations to run fresh
 * Call this when resetting app data to defaults
 */
export function resetDataVersionSystem(): void {
  // Clear the storage completely
  localStorage.removeItem(STORAGE_KEY);
  // Reset version to trigger migrations
  localStorage.removeItem(DATA_VERSION_KEY);
  // Run migrations (which will create fresh initial state)
  initializeDataVersion();
  runMigrations();
}
