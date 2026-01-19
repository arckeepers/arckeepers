import { test, expect, Page } from "@playwright/test";

const STORAGE_KEY = "arckeepers-storage";
const DATA_VERSION_KEY = "arckeepers-data-version";

// Helper to open the keeplist selector panel
async function openKeeplistSelector(page: Page) {
  // Click the Keeplists button in the header
  const keeplistButton = page.locator('button:has-text("Keeplists")');
  await keeplistButton.click();
  // Wait for the panel to appear - look for "Active Lists" tab
  await page.waitForSelector('text="Active Lists"', { timeout: 5000 });
  // Make sure we're on the "Active Lists" tab (which shows the KeeplistSelector)
  await page.locator('button:has-text("Active Lists")').click();
  await page.waitForTimeout(200);
}

// Helper to check if a keeplist is active (button has blue/green styling when active)
async function isKeeplistActive(page: Page, keeplistName: string): Promise<boolean> {
  // The keeplist button contains the name and has blue (system) or green (user) styling when active
  // We need to be more specific - look within the panel content
  const button = page.locator(`button:has-text("${keeplistName}")`).last();
  const classes = await button.getAttribute("class") || "";
  // Active keeplists have bg-blue (system) or bg-green (user) styling
  // Inactive keeplists have opacity-60
  return classes.includes("bg-blue") || classes.includes("bg-green");
}

// Helper to toggle a keeplist
async function toggleKeeplist(page: Page, keeplistName: string) {
  // Get the last button with this text (should be in the panel, not header)
  const button = page.locator(`button:has-text("${keeplistName}")`).last();
  await button.click();
}

// Helper to open settings menu
async function openSettingsMenu(page: Page) {
  // The settings button has a gear icon and title="Settings"
  const settingsButton = page.locator('button[title="Settings"]');
  await settingsButton.click();
  await page.waitForTimeout(200);
}

// Helper to close the keeplist panel
async function closeKeeplistPanel(page: Page) {
  // Click the X button or press Escape
  const closeButton = page.locator('button:has(svg.lucide-x)').first();
  if (await closeButton.isVisible()) {
    await closeButton.click();
  } else {
    await page.keyboard.press("Escape");
  }
  await page.waitForTimeout(200);
}

test.describe("Expedition 1 Keeplist Behavior", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to simulate a fresh user
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test.describe("New User Experience", () => {
    test("expedition-1 is disabled for a brand new user", async ({ page }) => {
      // Clear storage and reload to simulate new user
      await page.evaluate(() => {
        localStorage.clear();
      });
      await page.reload();
      await page.waitForTimeout(1000); // Give time for state to settle

      // Open the keeplist selector
      await openKeeplistSelector(page);

      // Expedition 1 should be inactive (not have green styling)
      const exp1Active = await isKeeplistActive(page, "Expedition 1");
      expect(exp1Active).toBe(false);

      // Workbenches should be active
      const workbenchesActive = await isKeeplistActive(page, "Workbenches");
      expect(workbenchesActive).toBe(true);
    });

    test("expedition-1 remains disabled after reload", async ({ page }) => {
      // Clear and load fresh
      await page.evaluate(() => {
        localStorage.clear();
      });
      await page.reload();
      await page.waitForTimeout(1000);

      // Reload again
      await page.reload();
      await page.waitForTimeout(1000);

      // Open keeplist selector
      await openKeeplistSelector(page);

      // Expedition 1 should still be disabled
      const exp1Active = await isKeeplistActive(page, "Expedition 1");
      expect(exp1Active).toBe(false);
    });

    test("user can enable expedition-1", async ({ page }) => {
      await page.evaluate(() => {
        localStorage.clear();
      });
      await page.reload();
      await page.waitForTimeout(1000);

      // Open keeplist selector
      await openKeeplistSelector(page);

      // Enable Expedition 1
      await toggleKeeplist(page, "Expedition 1");
      await page.waitForTimeout(200);

      // Should now be active
      const exp1Active = await isKeeplistActive(page, "Expedition 1");
      expect(exp1Active).toBe(true);

      // Close and reopen to verify persistence
      await closeKeeplistPanel(page);
      await page.reload();
      await page.waitForTimeout(1000);

      await openKeeplistSelector(page);
      const exp1ActiveAfterReload = await isKeeplistActive(page, "Expedition 1");
      expect(exp1ActiveAfterReload).toBe(true);
    });
  });

  test.describe("Existing User Migration", () => {
    test("migrates existing user with all keeplists active", async ({ page }) => {
      // Simulate an existing user with version 1 and empty activeKeeplistIds
      await page.evaluate(({ storageKey, versionKey }) => {
        // Set version to 1 (pre-migration)
        localStorage.setItem(versionKey, "1");

        // Set up state with empty activeKeeplistIds (meaning all active)
        const state = {
          state: {
            keeplists: [
              { id: "workbenches", name: "Workbenches", isSystem: true, items: [] },
              { id: "expedition-1", name: "Expedition 1", isSystem: true, items: [] },
              { id: "expedition-2", name: "Expedition 2", isSystem: true, items: [] },
            ],
            settings: {
              showCompleted: false,
              activeKeeplistIds: [], // Empty = all active
              animationsEnabled: true,
            },
          },
          version: 0,
        };
        localStorage.setItem(storageKey, JSON.stringify(state));
      }, { storageKey: STORAGE_KEY, versionKey: DATA_VERSION_KEY });

      // Reload to trigger migration
      await page.reload();
      await page.waitForTimeout(1000);

      // Open keeplist selector
      await openKeeplistSelector(page);

      // Expedition 1 should now be disabled after migration
      const exp1Active = await isKeeplistActive(page, "Expedition 1");
      expect(exp1Active).toBe(false);

      // Workbenches should still be enabled
      const workbenchesActive = await isKeeplistActive(page, "Workbenches");
      expect(workbenchesActive).toBe(true);
    });
  });

  test.describe("Reset Functionality", () => {
    test("reset disables expedition-1", async ({ page }) => {
      // Start fresh
      await page.evaluate(() => {
        localStorage.clear();
      });
      await page.reload();
      await page.waitForTimeout(1000);

      // Enable expedition-1
      await openKeeplistSelector(page);
      await toggleKeeplist(page, "Expedition 1");
      await page.waitForTimeout(200);

      // Verify it's enabled
      let exp1Active = await isKeeplistActive(page, "Expedition 1");
      expect(exp1Active).toBe(true);

      // Close keeplist panel
      await closeKeeplistPanel(page);

      // Open settings menu and click reset
      await openSettingsMenu(page);

      // Click "Reset to Defaults" button
      const resetButton = page.locator('button:has-text("Reset to Defaults")');
      await resetButton.click();

      // Confirm the reset in the dialog
      const confirmButton = page.locator('button:has-text("Reset")').last();
      await confirmButton.click();

      await page.waitForTimeout(500);

      // Re-check keeplist state
      await openKeeplistSelector(page);
      exp1Active = await isKeeplistActive(page, "Expedition 1");
      expect(exp1Active).toBe(false);
    });

    test("reset preserves user keeplists enabled state", async ({ page }) => {
      // Start fresh
      await page.evaluate(() => {
        localStorage.clear();
      });
      await page.reload();
      await page.waitForTimeout(1000);

      // Open keeplist panel and go to "My Keeplists" tab
      const keeplistButton = page.locator('button:has-text("Keeplists")');
      await keeplistButton.click();
      await page.waitForSelector('text="Active Lists"', { timeout: 5000 });
      
      // Switch to "My Keeplists" tab
      await page.locator('button:has-text("My Keeplists")').click();
      await page.waitForTimeout(200);

      // Enter a name for new keeplist and create it
      const nameInput = page.locator('input[placeholder*="name" i]').first();
      await nameInput.fill("Test Keeplist");
      await nameInput.press("Enter");

      await page.waitForTimeout(500);

      // Switch back to "Active Lists" tab to see the keeplist
      await page.locator('button:has-text("Active Lists")').click();
      await page.waitForTimeout(200);

      // Verify new keeplist is there and enabled
      let testKeeplistActive = await isKeeplistActive(page, "Test Keeplist");
      expect(testKeeplistActive).toBe(true);

      // Disable the test keeplist
      await toggleKeeplist(page, "Test Keeplist");
      await page.waitForTimeout(200);
      testKeeplistActive = await isKeeplistActive(page, "Test Keeplist");
      expect(testKeeplistActive).toBe(false);

      // Close keeplist panel
      await closeKeeplistPanel(page);

      // Open settings and reset
      await openSettingsMenu(page);
      const resetButton = page.locator('button:has-text("Reset to Defaults")');
      await resetButton.click();

      // Confirm reset
      const confirmButton = page.locator('button:has-text("Reset")').last();
      await confirmButton.click();

      await page.waitForTimeout(500);

      // Re-check keeplist state - test keeplist should still exist and still be disabled
      await openKeeplistSelector(page);
      testKeeplistActive = await isKeeplistActive(page, "Test Keeplist");
      expect(testKeeplistActive).toBe(false);
    });
  });
});
