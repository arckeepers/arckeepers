import { useState } from "react";
import { ArrowLeft, Download, Loader2, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import Papa from "papaparse";
import type { ApiResponse, ApiItem, RequiredItem, Rarity } from "../types";

export function DevPage() {
  const [items, setItems] = useState<RequiredItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Map API rarity to our Rarity type
  const mapRarity = (apiRarity: string): Rarity => {
    const normalized = apiRarity.toLowerCase();
    if (normalized === "common") return "Common";
    if (normalized === "uncommon") return "Uncommon";
    if (normalized === "rare") return "Rare";
    if (normalized === "epic") return "Epic";
    if (normalized === "legendary") return "Legendary";
    return "Common"; // Default fallback
  };

  // Fetch all items from the API (paginated)
  const fetchAllItems = async () => {
    setLoading(true);
    setError(null);
    setItems([]);
    setProgress({ current: 0, total: 0 });

    try {
      const allItems: RequiredItem[] = [];
      let page = 1;
      let hasMore = true;
      const limit = 100;

      while (hasMore) {
        const response = await fetch(
          `https://metaforge.app/api/arc-raiders/items?page=${page}&limit=${limit}`
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        // Map API items to RequiredItem format
        const mappedItems = data.data.map((apiItem: ApiItem) => ({
          id: apiItem.id,
          name: apiItem.name,
          rarity: mapRarity(apiItem.rarity),
        }));

        allItems.push(...mappedItems);
        setProgress({ current: allItems.length, total: data.pagination.total });

        hasMore = data.pagination.hasNextPage;
        page++;
      }

      setItems(allItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  // Download items as CSV
  const downloadCSV = () => {
    if (items.length === 0) return;

    const csv = Papa.unparse(items, {
      columns: ["id", "name", "rarity"],
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arc-raiders-items-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <h1 className="text-xl font-semibold">Developer Tools</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Item Crawler Section */}
        <section className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Item Crawler</h2>
          <p className="text-sm text-slate-400 mb-4">
            Fetch all items from the MetaForge API and export as CSV for use in
            the app.
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={fetchAllItems}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {loading ? "Fetching..." : "Fetch Items"}
            </button>

            <button
              onClick={downloadCSV}
              disabled={items.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download CSV ({items.length} items)
            </button>
          </div>

          {/* Progress */}
          {loading && progress.total > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-slate-400 mb-1">
                <span>Fetching items...</span>
                <span>
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{
                    width: `${(progress.current / progress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Results Preview */}
          {items.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-slate-300 mb-2">
                Preview (first 10 items)
              </h3>
              <div className="bg-slate-900 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-800">
                      <th className="text-left px-3 py-2 text-slate-400">ID</th>
                      <th className="text-left px-3 py-2 text-slate-400">
                        Name
                      </th>
                      <th className="text-left px-3 py-2 text-slate-400">
                        Rarity
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.slice(0, 10).map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-slate-800 hover:bg-slate-800/50"
                      >
                        <td className="px-3 py-2 font-mono text-slate-500">
                          {item.id}
                        </td>
                        <td className="px-3 py-2">{item.name}</td>
                        <td
                          className={`px-3 py-2 rarity-${item.rarity.toLowerCase()}`}
                        >
                          {item.rarity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {items.length > 10 && (
                <p className="text-xs text-slate-500 mt-2">
                  ...and {items.length - 10} more items
                </p>
              )}
            </div>
          )}
        </section>

        {/* API Info */}
        <section className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold mb-4">API Information</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-400">Endpoint</dt>
              <dd className="font-mono text-blue-400">
                https://metaforge.app/api/arc-raiders/items
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">Parameters</dt>
              <dd className="text-slate-300">
                <code className="bg-slate-800 px-1 rounded">page</code>,{" "}
                <code className="bg-slate-800 px-1 rounded">limit</code>
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">Attribution</dt>
              <dd className="text-slate-300">
                Data provided by{" "}
                <a
                  href="https://metaforge.app/arc-raiders"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  MetaForge
                </a>
              </dd>
            </div>
          </dl>
        </section>
      </main>
    </div>
  );
}
