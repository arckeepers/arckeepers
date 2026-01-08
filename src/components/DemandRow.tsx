import { useState, useEffect, useRef, memo } from "react";
import { Minus, Plus, Check } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { useStatusAnnouncer } from "../hooks/useStatusAnnouncer";
import { posthog } from "../utils/posthog";
import type { KeeplistItem } from "../types";

/** Fade timing - delay before fade starts */
const FADE_DELAY_MS = 500;

interface DemandRowProps {
  keeplistId: string;
  keeplistName: string;
  item: KeeplistItem;
  compact?: boolean;
  itemIndex?: number;
  demandIndex?: number;
  showCompleted: boolean;
}

export const DemandRow = memo(function DemandRow({
  keeplistId,
  keeplistName,
  item,
  compact = false,
  itemIndex = 0,
  demandIndex = 0,
  showCompleted,
}: DemandRowProps) {
  // Should this row be hidden? (completed and not showing completed items)
  const shouldHide = item.isCompleted && !showCompleted;

  // Track previous shouldHide value to detect transitions
  const prevShouldHideRef = useRef(shouldHide);

  // Initialize to 'hidden' if already completed (prevents flicker on load)
  const [fadeState, setFadeState] = useState<"visible" | "fading" | "hidden">(
    () => (shouldHide ? "hidden" : "visible")
  );
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { updateItemQty, completeItem, settings } = useAppStore();
  const { announce } = useStatusAnnouncer();
  const animationsEnabled = settings.animationsEnabled;
  const prevCompletedRef = useRef(item.isCompleted);

  // Handlers with screen reader announcements
  const handleIncrement = () => {
    updateItemQty(keeplistId, item.itemId, 1);
    const newQty = item.qtyOwned + 1;
    const remaining = item.qtyRequired > 0 ? item.qtyRequired - newQty : null;
    if (remaining !== null && remaining <= 0) {
      announce(`${keeplistName}: Complete!`);
    } else if (remaining !== null) {
      announce(`${keeplistName}: ${newQty} of ${item.qtyRequired}`);
    } else {
      announce(`${keeplistName}: ${newQty}`);
    }
  };

  const handleDecrement = () => {
    if (item.qtyOwned > 0) {
      updateItemQty(keeplistId, item.itemId, -1);
      const newQty = item.qtyOwned - 1;
      announce(
        `${keeplistName}: ${newQty} of ${
          item.qtyRequired > 0 ? item.qtyRequired : "unlimited"
        }`
      );
    }
  };

  const handleComplete = () => {
    completeItem(keeplistId, item.itemId);
    announce(`${keeplistName}: Marked complete!`);
    // Track event
    posthog?.capture("item completed", {
      keeplist_id: keeplistId,
      keeplist_name: keeplistName,
      item_id: item.itemId,
      qty_required: item.qtyRequired,
      qty_owned: item.qtyRequired, // Will be set to required
    });
  };

  // Calculate tabIndex for custom tab order:
  // 1. Search box (tabIndex=1)
  // 2. All + buttons (100-9999)
  // 3. All ✓ buttons (10000-19999)
  // 4. All - buttons (20000-29999)
  // 5. Clear button (tabIndex=30000)
  const baseIndex = itemIndex * 100 + demandIndex;
  const incrementTabIndex = 100 + baseIndex;
  const completeTabIndex = 10000 + baseIndex;
  const decrementTabIndex = 20000 + baseIndex;

  // Track item completion event when item becomes completed
  useEffect(() => {
    const prevCompleted = prevCompletedRef.current;
    prevCompletedRef.current = item.isCompleted;

    // Track when item transitions from incomplete to completed
    if (!prevCompleted && item.isCompleted) {
      posthog?.capture("item completed", {
        keeplist_id: keeplistId,
        keeplist_name: keeplistName,
        item_id: item.itemId,
        qty_required: item.qtyRequired,
        qty_owned: item.qtyOwned,
      });
    }
  }, [
    item.isCompleted,
    item.itemId,
    item.qtyOwned,
    item.qtyRequired,
    keeplistId,
    keeplistName,
  ]);

  // Handle fade state transitions
  useEffect(() => {
    const prevShouldHide = prevShouldHideRef.current;
    prevShouldHideRef.current = shouldHide;

    // Clear any existing timer
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }

    // Transition: was hiding -> now showing (user toggled "show completed")
    if (prevShouldHide && !shouldHide) {
      // Use microtask to avoid synchronous setState in effect
      queueMicrotask(() => setFadeState("visible"));
      return;
    }

    // Transition: was showing -> now hiding
    if (!prevShouldHide && shouldHide) {
      if (!animationsEnabled) {
        // No animation - hide immediately (use microtask)
        queueMicrotask(() => setFadeState("hidden"));
      } else {
        // Start fade after delay
        fadeTimerRef.current = setTimeout(() => {
          setFadeState("fading");
        }, FADE_DELAY_MS);
      }
      return;
    }

    // Already hiding and animations just got disabled
    if (shouldHide && !animationsEnabled && fadeState !== "hidden") {
      queueMicrotask(() => setFadeState("hidden"));
    }

    return () => {
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
      }
    };
  }, [shouldHide, animationsEnabled, fadeState]);

  // Handle CSS animation end - cleaner than JavaScript timers
  const handleAnimationEnd = () => {
    if (fadeState === "fading") {
      setFadeState("hidden");
    }
  };

  // Don't render if hidden
  if (fadeState === "hidden") {
    return null;
  }

  const showFadeAnimation = fadeState === "fading";

  const progressPercent =
    item.qtyRequired > 0
      ? Math.min(100, (item.qtyOwned / item.qtyRequired) * 100)
      : 0;

  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 py-1.5 px-2.5 rounded transition-opacity ${
          item.isCompleted ? "row-completed bg-slate-900/50" : "bg-slate-900/80"
        } ${showFadeAnimation ? "fade-out" : ""}`}
        onAnimationEnd={handleAnimationEnd}
      >
        {/* Keeplist name - 50% wider (w-36 instead of w-24) */}
        <span className="text-xs text-slate-500 w-36 truncate flex-shrink-0">
          {keeplistName}
        </span>

        {/* Progress bar */}
        <div className="flex-1 progress-bar min-w-[60px]">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Quantity display */}
        <span className="text-xs font-mono flex-shrink-0">
          <span
            className={item.isCompleted ? "text-green-400" : "text-slate-200"}
          >
            {item.qtyOwned}
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">
            {item.qtyRequired > 0 ? item.qtyRequired : "∞"}
          </span>
        </span>

        {/* Compact controls - larger buttons with more spacing */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleDecrement}
            disabled={item.qtyOwned === 0}
            tabIndex={decrementTabIndex}
            className="p-1.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Decrease quantity"
            aria-label={`Decrease quantity for ${keeplistName}`}
          >
            <Minus className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            onClick={handleIncrement}
            tabIndex={incrementTabIndex}
            className="p-1.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
            title="Increase quantity"
            aria-label={`Increase quantity for ${keeplistName}`}
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            onClick={handleComplete}
            disabled={item.isCompleted}
            tabIndex={completeTabIndex}
            className={`p-1.5 rounded transition-colors ${
              item.isCompleted
                ? "bg-green-600 text-white cursor-default"
                : "bg-slate-700 text-slate-300 hover:bg-green-600 hover:text-white"
            }`}
            title={item.isCompleted ? "Completed" : "Mark as complete"}
            aria-label={
              item.isCompleted
                ? `${keeplistName} completed`
                : `Mark ${keeplistName} as complete`
            }
          >
            <Check className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  // Non-compact mobile-friendly layout
  return (
    <div
      className={`rounded-lg transition-opacity ${
        item.isCompleted ? "row-completed bg-slate-800/50" : "bg-slate-800"
      } ${showFadeAnimation ? "fade-out" : ""}`}
      onAnimationEnd={handleAnimationEnd}
    >
      {/* Top row: Keeplist name and quantity */}
      <div className="flex items-center justify-between px-3 pt-2">
        <span className="text-sm text-slate-400 truncate">{keeplistName}</span>
        <span className="text-sm font-mono">
          <span
            className={item.isCompleted ? "text-green-400" : "text-slate-200"}
          >
            {item.qtyOwned}
          </span>
          <span className="text-slate-500"> / </span>
          <span className="text-slate-400">
            {item.qtyRequired > 0 ? item.qtyRequired : "∞"}
          </span>
        </span>
      </div>

      {/* Bottom row: Progress bar and controls */}
      <div className="flex items-center gap-3 px-3 pb-2 pt-1">
        {/* Progress bar */}
        <div className="flex-1 progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Controls - larger touch targets for mobile */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleDecrement}
            disabled={item.qtyOwned === 0}
            tabIndex={decrementTabIndex}
            className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 active:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Decrease quantity"
            aria-label={`Decrease quantity for ${keeplistName}`}
          >
            <Minus className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            onClick={handleIncrement}
            tabIndex={incrementTabIndex}
            className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 active:bg-slate-500 transition-colors"
            title="Increase quantity"
            aria-label={`Increase quantity for ${keeplistName}`}
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            onClick={handleComplete}
            disabled={item.isCompleted}
            tabIndex={completeTabIndex}
            className={`p-2 rounded-lg transition-colors ${
              item.isCompleted
                ? "bg-green-600 text-white cursor-default"
                : "bg-slate-700 text-slate-300 hover:bg-green-600 active:bg-green-500 hover:text-white"
            }`}
            title={item.isCompleted ? "Completed" : "Mark as complete"}
            aria-label={
              item.isCompleted
                ? `${keeplistName} completed`
                : `Mark ${keeplistName} as complete`
            }
          >
            <Check className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
});
