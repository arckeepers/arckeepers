import { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

export function Intro() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <Info className="w-4 h-4" />
        <span>How does Arc Keepers work?</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isOpen && (
        <div className="mt-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-sm text-slate-300 space-y-3">
          <p>
            <strong className="text-slate-100">Arc Keepers</strong> is a loot
            tracking companion for ARC Raiders. It helps you track which rare or
            difficult to find items you need to complete workbenches, projects
            and quests.
          </p>

          <div>
            <strong className="text-slate-100">Keeplists</strong> are
            collections of items that you need to keep:
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>
                <strong>Workbenches</strong> — Items needed for building your
                workbenches for new or expeditioned players
              </li>
              <li>
                <strong>Expedition 2</strong> — Items for the expedition project
              </li>
              <li>
                <strong>Quests</strong> — Consolidated quest requirements
              </li>
              <li>
                <strong>Projects</strong> — Seasonal event projects
              </li>
            </ul>
          </div>

          <p>
            <strong className="text-slate-100">Allocated Inventory:</strong>{" "}
            Items are tracked per-list, e.g. Leaper Pulse Units for workbenches,
            quests and projects are tracked separately
          </p>

          <p>
            <strong className="text-slate-100">Keyboard Tip:</strong> Just start
            typing to search! Press any letter key and the search bar will focus
            automatically.
          </p>
        </div>
      )}
    </div>
  );
}
