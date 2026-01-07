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
  itemIndex: number;
}

export function ItemCard({ item, demands, showCompleted, itemIndex }: ItemCardProps) {
  const [shouldFadeOut, setShouldFadeOut] = useState(false);

  // Check if all demands are completed
  const allCompleted = demands.every((d) => d.item.isCompleted);

  // Calculate total quantity still needed across all keeplists
  const totalNeeded = demands.reduce((sum, d) => {
    const remaining = Math.max(0, d.item.qtyRequired - d.item.qtyOwned);
    return sum + remaining;
  }, 0);

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

  const rarityBgClass = `rarity-bg-${item.rarity.toLowerCase()}`;

  return (
    <div
      className={`bg-slate-800/80 rounded-lg overflow-hidden transition-all duration-500 ${
        allCompleted && !showCompleted ? "fade-out" : ""
      }`}
    >
      <div className="flex items-stretch p-2 gap-3">
        {/* Left: Item icon with rarity border */}
        <div className="relative flex-shrink-0">
          <div
            className={`absolute inset-y-0 left-0 w-1 rounded-l ${rarityBgClass}`}
          />
          <div className="w-16 h-16 bg-slate-900 rounded overflow-hidden ml-1 relative">
            <img
              src={getItemImage(item.id)}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://placehold.co/64x64/1e293b/64748b?text=${item.name.substring(0, 2).toUpperCase()}`;
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
          <h3 className="text-sm font-medium text-slate-100 leading-tight">{item.name}</h3>
          <p className={`text-xs rarity-${item.rarity.toLowerCase()}`}>
            {item.rarity} · {visibleDemands.length} list{visibleDemands.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Right: Keeplist demand rows stacked */}
        <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
          {visibleDemands.map((demand, demandIndex) => (
            <DemandRow
              key={`${demand.keeplistId}-${demand.item.itemId}`}
              keeplistId={demand.keeplistId}
              keeplistName={demand.keeplistName}
              item={demand.item}
              compact
              itemIndex={itemIndex}
              demandIndex={demandIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
