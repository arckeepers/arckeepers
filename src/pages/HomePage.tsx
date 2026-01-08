import { useState, useMemo } from "react";
import { Header } from "../components/Header";
import { SearchBar } from "../components/SearchBar";
import { Intro } from "../components/Intro";
import { ItemCard } from "../components/ItemCard";
import { useAppStore } from "../store/useAppStore";
import { getItemByIdWithFallback } from "../data/allItems";
import type { KeeplistItem, RequiredItem } from "../types";

interface DemandInfo {
  keeplistId: string;
  keeplistName: string;
  item: KeeplistItem;
}

interface ItemWithDemands {
  item: RequiredItem;
  demands: DemandInfo[];
}

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { keeplists, settings } = useAppStore();

  // Determine active keeplists
  const activeKeeplists = useMemo(() => {
    if (settings.activeKeeplistIds.length === 0) {
      return keeplists; // All are active
    }
    return keeplists.filter((kl) => settings.activeKeeplistIds.includes(kl.id));
  }, [keeplists, settings.activeKeeplistIds]);

  // Build aggregated item list with all demands from active keeplists only
  const itemsWithDemands = useMemo(() => {
    const demandMap = new Map<string, DemandInfo[]>();

    // Collect all demands from active keeplists only
    for (const keeplist of activeKeeplists) {
      for (const keeplistItem of keeplist.items) {
        const demands = demandMap.get(keeplistItem.itemId) || [];
        demands.push({
          keeplistId: keeplist.id,
          keeplistName: keeplist.name,
          item: keeplistItem,
        });
        demandMap.set(keeplistItem.itemId, demands);
      }
    }

    // Convert to array with item metadata
    const result: ItemWithDemands[] = [];
    for (const [itemId, demands] of demandMap) {
      const item = getItemByIdWithFallback(itemId);
      result.push({ item, demands });
    }

    // Sort alphabetically by item name
    result.sort((a, b) => a.item.name.localeCompare(b.item.name));

    return result;
  }, [activeKeeplists]);

  // Filter items based on search query (fuzzy/subtext matching)
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return itemsWithDemands;
    }

    const query = searchQuery.toLowerCase();
    return itemsWithDemands.filter((entry) =>
      entry.item.name.toLowerCase().includes(query)
    );
  }, [itemsWithDemands, searchQuery]);

  // Note: We don't filter by completion status here anymore.
  // ItemCard handles showing/hiding completed items with fade-out animation.
  // This allows the fade animation to play before items are removed.
  const visibleItems = filteredItems;

  return (
    <div className="min-h-screen">
      <Header />
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <Intro />

      <main className="max-w-4xl mx-auto px-4 pb-8">
        {visibleItems.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            {searchQuery ? (
              <p>No items match "{searchQuery}"</p>
            ) : (
              <p>No items to display.</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {visibleItems.map((entry, itemIndex) => (
              <ItemCard
                key={entry.item.id}
                item={entry.item}
                demands={entry.demands}
                showCompleted={settings.showCompleted}
                itemIndex={itemIndex}
              />
            ))}
          </div>
        )}

        {/* Item count footer */}
        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-slate-500">
          <span>{itemsWithDemands.length} items</span>
          <span
            className="text-2xl font-bold text-slate-600 select-none"
            aria-hidden="true"
          >
            &middot;
          </span>
          <span>
            Data provided by{" "}
            <a
              href="https://metaforge.app/arc-raiders"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              MetaForge
            </a>
          </span>
        </div>
      </main>
    </div>
  );
}
