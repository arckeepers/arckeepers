import { useState, useEffect, useRef } from "react";
import { Minus, Plus, Check } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import type { KeeplistItem } from "../types";

/** Fade timing (shared with ItemCard) */
const FADE_DELAY_MS = 500;
const FADE_ANIMATION_MS = 500;

interface DemandRowProps {
  keeplistId: string;
  keeplistName: string;
  item: KeeplistItem;
  compact?: boolean;
  itemIndex?: number;
  demandIndex?: number;
  showCompleted: boolean;
}

export function DemandRow({
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

  // All hooks must be called before any early returns
  // Initialize to 'hidden' if already completed (prevents flicker on load)
  const [fadeState, setFadeState] = useState<"visible" | "fading" | "hidden">(
    () => shouldHide ? "hidden" : "visible"
  );
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { updateItemQty, completeItem, settings } = useAppStore();
  const animationsEnabled = settings.animationsEnabled;

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

  // Handle state transitions during render (outside effect to avoid lint warnings)
  // Reset to visible when shouldHide becomes false
  if (!shouldHide && fadeState !== "visible") {
    setFadeState("visible");
  }
  // When animations disabled, hide immediately (no fade)
  if (shouldHide && !animationsEnabled && fadeState !== "hidden") {
    setFadeState("hidden");
  }

  // Handle fade-out timing (only when animations enabled)
  useEffect(() => {
    // Skip if animations disabled (handled synchronously above)
    if (!animationsEnabled) return;

    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }

    if (shouldHide && fadeState === "visible") {
      fadeTimerRef.current = setTimeout(() => {
        setFadeState("fading");
        fadeTimerRef.current = setTimeout(() => {
          setFadeState("hidden");
        }, FADE_ANIMATION_MS);
      }, FADE_DELAY_MS);
    }

    return () => {
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
      }
    };
  }, [shouldHide, fadeState, animationsEnabled]);

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
            onClick={() => updateItemQty(keeplistId, item.itemId, -1)}
            disabled={item.qtyOwned === 0}
            tabIndex={decrementTabIndex}
            className="p-1.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Decrease quantity"
            aria-label={`Decrease quantity for ${keeplistName}`}
          >
            <Minus className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            onClick={() => updateItemQty(keeplistId, item.itemId, 1)}
            tabIndex={incrementTabIndex}
            className="p-1.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
            title="Increase quantity"
            aria-label={`Increase quantity for ${keeplistName}`}
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            onClick={() => completeItem(keeplistId, item.itemId)}
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
            onClick={() => updateItemQty(keeplistId, item.itemId, -1)}
            disabled={item.qtyOwned === 0}
            tabIndex={decrementTabIndex}
            className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 active:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Decrease quantity"
            aria-label={`Decrease quantity for ${keeplistName}`}
          >
            <Minus className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            onClick={() => updateItemQty(keeplistId, item.itemId, 1)}
            tabIndex={incrementTabIndex}
            className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 active:bg-slate-500 transition-colors"
            title="Increase quantity"
            aria-label={`Increase quantity for ${keeplistName}`}
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            onClick={() => completeItem(keeplistId, item.itemId)}
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
}
