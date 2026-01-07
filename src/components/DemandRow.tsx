import { Minus, Plus, Check } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import type { KeeplistItem } from "../types";

interface DemandRowProps {
  keeplistId: string;
  keeplistName: string;
  item: KeeplistItem;
}

export function DemandRow({ keeplistId, keeplistName, item }: DemandRowProps) {
  const { updateItemQty, completeItem } = useAppStore();

  const progressPercent =
    item.qtyRequired > 0
      ? Math.min(100, (item.qtyOwned / item.qtyRequired) * 100)
      : 0;

  return (
    <div
      className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-opacity ${
        item.isCompleted ? "row-completed bg-slate-800/50" : "bg-slate-800"
      }`}
    >
      {/* Keeplist name */}
      <span className="text-sm text-slate-400 min-w-[100px] truncate">
        {keeplistName}
      </span>

      {/* Progress bar */}
      <div className="flex-1 progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Quantity display */}
      <span className="text-sm font-mono min-w-[60px] text-right">
        <span className={item.isCompleted ? "text-green-400" : "text-slate-200"}>
          {item.qtyOwned}
        </span>
        <span className="text-slate-500"> / </span>
        <span className="text-slate-400">
          {item.qtyRequired > 0 ? item.qtyRequired : "∞"}
        </span>
      </span>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => updateItemQty(keeplistId, item.itemId, -1)}
          disabled={item.qtyOwned === 0}
          className="p-1.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Decrease quantity"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          onClick={() => updateItemQty(keeplistId, item.itemId, 1)}
          className="p-1.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
          title="Increase quantity"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={() => completeItem(keeplistId, item.itemId)}
          disabled={item.isCompleted}
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
