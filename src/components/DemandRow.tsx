import { Minus, Plus, Check } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import type { KeeplistItem } from "../types";

interface DemandRowProps {
  keeplistId: string;
  keeplistName: string;
  item: KeeplistItem;
  compact?: boolean;
  itemIndex?: number;
  demandIndex?: number;
}

export function DemandRow({ keeplistId, keeplistName, item, compact = false, itemIndex = 0, demandIndex = 0 }: DemandRowProps) {
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
  const { updateItemQty, completeItem } = useAppStore();

  const progressPercent =
    item.qtyRequired > 0
      ? Math.min(100, (item.qtyOwned / item.qtyRequired) * 100)
      : 0;

  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 py-1.5 px-2.5 rounded transition-opacity ${
          item.isCompleted ? "row-completed bg-slate-900/50" : "bg-slate-900/80"
        }`}
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
          <span className={item.isCompleted ? "text-green-400" : "text-slate-200"}>
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
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            onClick={() => updateItemQty(keeplistId, item.itemId, 1)}
            tabIndex={incrementTabIndex}
            className="p-1.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
            title="Increase quantity"
          >
            <Plus className="w-4 h-4" />
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
          >
            <Check className="w-4 h-4" />
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
      }`}
    >
      {/* Top row: Keeplist name and quantity */}
      <div className="flex items-center justify-between px-3 pt-2">
        <span className="text-sm text-slate-400 truncate">
          {keeplistName}
        </span>
        <span className="text-sm font-mono">
          <span className={item.isCompleted ? "text-green-400" : "text-slate-200"}>
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
          >
            <Minus className="w-5 h-5" />
          </button>

          <button
            onClick={() => updateItemQty(keeplistId, item.itemId, 1)}
            tabIndex={incrementTabIndex}
            className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 active:bg-slate-500 transition-colors"
            title="Increase quantity"
          >
            <Plus className="w-5 h-5" />
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
          >
            <Check className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
