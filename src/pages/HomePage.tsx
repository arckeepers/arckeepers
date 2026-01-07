import { useState, useMemo } from "react";
import { Header } from "../components/Header";
import { SearchBar } from "../components/SearchBar";
import { Intro } from "../components/Intro";
import { ItemCard } from "../components/ItemCard";
import { useAppStore } from "../store/useAppStore";
import { allItems } from "../data/allItems";
import type { RequiredItem, KeeplistItem } from "../types";

// Build items lookup map
const itemsMap = new Map<string, RequiredItem>(
  allItems.map((item) => [item.id, item])
);

// Get item by ID, with fallback to creating a placeholder for unknown items
function getItemById(itemId: string): RequiredItem {
  const item = itemsMap.get(itemId);
  if (item) return item;

  // Create a placeholder for unknown items (display the ID as name)
  return {
    id: itemId,
    name: itemId.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    rarity: "Common",
  };
}

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
      const item = getItemById(itemId);
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

  // Further filter based on completion status
  const visibleItems = useMemo(() => {
    if (settings.showCompleted) {
      return filteredItems;
    }

    // Only show items that have at least one incomplete demand
    return filteredItems.filter((entry) =>
      entry.demands.some((d) => !d.item.isCompleted)
    );
  }, [filteredItems, settings.showCompleted]);

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <Intro />

      <main className="max-w-4xl mx-auto px-4 pb-8">
        {visibleItems.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            {searchQuery ? (
              <p>No items match "{searchQuery}"</p>
            ) : settings.showCompleted ? (
              <p>No items to display.</p>
            ) : (
              <p>
                All items complete! Toggle "Show Completed" to view them.
              </p>
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
        <div className="mt-6 text-center text-sm text-slate-500">
          Showing {visibleItems.length} of {itemsWithDemands.length} items
        </div>
      </main>
    </div>
  );
}
