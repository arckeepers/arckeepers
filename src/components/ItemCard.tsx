import { useState, useEffect, useRef, memo } from "react";
import { DemandRow } from "./DemandRow";
import { getItemImage, type RequiredItem, type KeeplistItem } from "../types";
import { useAppStore } from "../store/useAppStore";

/** Fade timing - delay before fade starts */
const FADE_DELAY_MS = 500;

interface DemandInfo {
  keeplistId: string;
  keeplistName: string;
  item: KeeplistItem;
}

interface ItemCardProps {
  item: RequiredItem;
  demands: DemandInfo[];
  showCompleted: boolean;
  itemIndex: number;
}

export const ItemCard = memo(function ItemCard({
  item,
  demands,
  showCompleted,
  itemIndex,
}: ItemCardProps) {
  // Get animations setting from store
  const animationsEnabled = useAppStore(
    (state) => state.settings.animationsEnabled
  );

  // Check if all demands are completed
  const allCompleted = demands.every((d) => d.item.isCompleted);

  // Should this card be hidden? (all complete and not showing completed)
  const shouldHide = allCompleted && !showCompleted;

  // Track previous shouldHide value to detect transitions
  const prevShouldHideRef = useRef(shouldHide);

  // Track fade state - initialize to 'hidden' if already completed (prevents flicker on load)
  const [fadeState, setFadeState] = useState<"visible" | "fading" | "hidden">(
    () => (shouldHide ? "hidden" : "visible")
  );
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate total quantity still needed across all keeplists
  const totalNeeded = demands.reduce((sum, d) => {
    const remaining = Math.max(0, d.item.qtyRequired - d.item.qtyOwned);
    return sum + remaining;
  }, 0);

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

  // We're "fading out" anytime we should hide (includes delay period AND animation)
  // This ensures the card stays visible during the delay before animation starts
  const isFadingOut = shouldHide;

  // Only apply the CSS animation class when actually animating (not during delay)
  const showFadeAnimation = fadeState === "fading";

  // Always render all demands - DemandRow handles its own fade-out for individual rows
  // This allows each row to animate independently when completed
  const visibleDemands = demands;

  // Count of non-completed demands for display purposes
  const activeDemandsCount = demands.filter((d) => !d.item.isCompleted).length;
  const displayCount = showCompleted ? demands.length : activeDemandsCount;

  // Don't render if no demands at all, or if all hidden (all complete and not showing completed, after fade)
  if (
    demands.length === 0 ||
    (activeDemandsCount === 0 && !showCompleted && !isFadingOut)
  ) {
    return null;
  }

  const rarityBgClass = `rarity-bg-${item.rarity.toLowerCase()}`;

  return (
    <div
      className={`bg-slate-800/80 rounded-lg overflow-hidden ${
        showFadeAnimation ? "fade-out" : ""
      }`}
      onAnimationEnd={handleAnimationEnd}
    >
      {/* Desktop: horizontal layout */}
      <div className="hidden md:flex items-center p-2 gap-3">
        {/* Left: Item icon with rarity border */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 bg-slate-900 rounded overflow-hidden ml-1 relative">
            <div
              className={`absolute inset-y-0 left-0 w-1 rounded-l ${rarityBgClass}`}
            />
            <img
              src={getItemImage(item.id)}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Use inline SVG data URL as fallback (no external dependency)
                const initials = item.name.substring(0, 2).toUpperCase();
                e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect fill="#1e293b" width="64" height="64"/><text x="32" y="38" font-family="system-ui,sans-serif" font-size="20" fill="#64748b" text-anchor="middle">${initials}</text></svg>`
                )}`;
              }}
            />
            {/* Quantity badge */}
            {totalNeeded > 0 && (
              <div className="absolute bottom-0.5 right-0.5 bg-slate-900/90 px-1 py-0.5 rounded text-xs font-bold text-slate-100">
                ×{totalNeeded}
              </div>
            )}
          </div>
        </div>

        {/* Middle: Item name and rarity */}
        <div className="flex-shrink-0 w-36 flex flex-col justify-center">
          <h3 className="text-sm font-medium text-slate-100 leading-tight">
            {item.name}
          </h3>
          <p className={`text-xs rarity-${item.rarity.toLowerCase()}`}>
            {item.rarity} · {displayCount} list
            {displayCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Right: Keeplist demand rows stacked */}
        <div className="flex-1 flex flex-col gap-1 min-w-0">
          {visibleDemands
            .sort((a, b) => a.keeplistName.localeCompare(b.keeplistName))
            .map((demand, demandIndex) => (
              <DemandRow
                key={`${demand.keeplistId}-${demand.item.itemId}`}
                keeplistId={demand.keeplistId}
                keeplistName={demand.keeplistName}
                item={demand.item}
                compact
                itemIndex={itemIndex}
                demandIndex={demandIndex}
                showCompleted={showCompleted}
              />
            ))}
        </div>
      </div>

      {/* Mobile: vertical layout */}
      <div className="md:hidden">
        {/* Header with icon and item info */}
        <div className="flex items-center gap-3 p-3">
          {/* Item icon with rarity border */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 bg-slate-900 rounded overflow-hidden ml-1 relative">
              <div
                className={`absolute inset-y-0 left-0 w-1 rounded-l ${rarityBgClass}`}
              />
              <img
                src={getItemImage(item.id)}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Use inline SVG data URL as fallback (no external dependency)
                  const initials = item.name.substring(0, 2).toUpperCase();
                  e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect fill="#1e293b" width="56" height="56"/><text x="28" y="34" font-family="system-ui,sans-serif" font-size="18" fill="#64748b" text-anchor="middle">${initials}</text></svg>`
                  )}`;
                }}
              />
              {/* Quantity badge */}
              {totalNeeded > 0 && (
                <div className="absolute bottom-0 right-0 bg-slate-900/90 px-1 py-0.5 rounded text-xs font-bold text-slate-100">
                  ×{totalNeeded}
                </div>
              )}
            </div>
          </div>

          {/* Item name and rarity */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium text-slate-100 leading-tight truncate">
              {item.name}
            </h3>
            <p className={`text-xs rarity-${item.rarity.toLowerCase()}`}>
              {item.rarity} · {displayCount} list
              {displayCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Keeplist demand rows below */}
        <div className="px-3 pb-3 space-y-2">
          {visibleDemands.map((demand, demandIndex) => (
            <DemandRow
              key={`${demand.keeplistId}-${demand.item.itemId}`}
              keeplistId={demand.keeplistId}
              keeplistName={demand.keeplistName}
              item={demand.item}
              compact={false}
              itemIndex={itemIndex}
              demandIndex={demandIndex}
              showCompleted={showCompleted}
            />
          ))}
        </div>
      </div>
    </div>
  );
});
