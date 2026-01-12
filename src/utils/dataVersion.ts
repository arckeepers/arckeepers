/**
 * Data Version System
 * 
 * Manages data versioning and migrations for localStorage data.
 * When the data format or key lists change, increment DATA_VERSION
 * and add a migration function to handle the upgrade.
 */

// Current application data version
// Increment this when data format changes require migrations
export const DATA_VERSION = 1;

// LocalStorage key for storing the user's data version
const DATA_VERSION_KEY = "arckeepers-data-version";

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
  console.log(
    `Migrating data from version ${localVersion} to ${appVersion}`
  );

  // Migration logic will go here as versions increase
  // Example structure:
  // if (localVersion < 2) {
  //   migrateToVersion2();
  //   localVersion = 2;
  // }
  // if (localVersion < 3) {
  //   migrateToVersion3();
  //   localVersion = 3;
  // }

  // Update local version to match app version
  setLocalDataVersion(appVersion);
}

/**
 * Initialize the data version system
 * Call this once at app startup
 */
export function initializeDataVersionSystem(): void {
  initializeDataVersion();
  runMigrations();
}
