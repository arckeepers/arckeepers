import { useState, useEffect } from "react";
import { DemandRow } from "./DemandRow";
import { getItemImage, type RequiredItem, type KeeplistItem } from "../types";

interface DemandInfo {
  keeplistId: string;
  keeplistName: string;
  item: KeeplistItem;
}

interface ItemCardProps {
  item: RequiredItem;
  demands: DemandInfo[];
  showCompleted: boolean;
}

export function ItemCard({ item, demands, showCompleted }: ItemCardProps) {
  const [shouldFadeOut, setShouldFadeOut] = useState(false);

  // Check if all demands are completed
  const allCompleted = demands.every((d) => d.item.isCompleted);

  // Trigger fade-out animation when all demands become completed
  useEffect(() => {
    if (allCompleted && !showCompleted) {
      // Wait 5 seconds before starting fade-out
      const timer = setTimeout(() => {
        setShouldFadeOut(true);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShouldFadeOut(false);
    }
  }, [allCompleted, showCompleted]);

  // Don't render if fading out and not showing completed
  if (shouldFadeOut && !showCompleted) {
    return null;
  }

  // Filter demands based on showCompleted setting
  const visibleDemands = showCompleted
    ? demands
    : demands.filter((d) => !d.item.isCompleted);

  // Don't render if no visible demands
  if (visibleDemands.length === 0) {
    return null;
  }

  const rarityClass = `rarity-${item.rarity.toLowerCase()}`;

  return (
    <div
      className={`bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden transition-all duration-500 ${
        allCompleted && !showCompleted ? "fade-out" : ""
      }`}
    >
      {/* Card Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-700">
        {/* Item image */}
        <img
          src={getItemImage(item.id)}
          alt={item.name}
          className="w-12 h-12 rounded-lg bg-slate-700"
        />

        {/* Item name */}
        <h3 className="flex-1 text-lg font-semibold text-slate-100">
          {item.name}
        </h3>

        {/* Rarity badge */}
        <span
          className={`px-2 py-1 text-xs font-medium rounded border ${rarityClass}`}
        >
          {item.rarity}
        </span>
      </div>

      {/* Demand Rows */}
      <div className="p-3 space-y-2">
        {visibleDemands.map((demand) => (
          <DemandRow
            key={`${demand.keeplistId}-${demand.item.itemId}`}
            keeplistId={demand.keeplistId}
            keeplistName={demand.keeplistName}
            item={demand.item}
          />
        ))}
      </div>
    </div>
  );
}
