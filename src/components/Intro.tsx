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
        <span>How does ARC Keepers work?</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isOpen && (
        <div className="mt-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-sm text-slate-300 space-y-3">
          <p>
            <strong className="text-slate-100">ARC Keepers</strong> is a loot
            tracking companion for ARC Raiders. It helps you track which rare
            items you need to complete workbenches, projects and quests. Very
            common items are intentionally excluded.
          </p>

          <p>
            <strong className="text-slate-100">Keeplists</strong> are
            collections of items that you need to keep for different purposes,
            e.g. for Projects, Scrappy, or seasonal events.
          </p>

          <p>
            <strong className="text-slate-100">Your Keeplists:</strong> You can
            create custom keeplists to track items you need e.g. for crafting or
            recycling. Items in these keeplists are tracked separately.
          </p>

          <p>
            <strong className="text-slate-100">Keyboard Tip:</strong> Just start
            typing to search! Press any letter key and the search bar will focus
            automatically. Press Escape to clear the search.
          </p>
        </div>
      )}
    </div>
  );
}
