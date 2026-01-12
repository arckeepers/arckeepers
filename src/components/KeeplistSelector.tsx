import { Check, List } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

export function KeeplistSelector() {
  const keeplists = useAppStore((state) => state.keeplists);
  const activeKeeplistIds = useAppStore(
    (state) => state.settings.activeKeeplistIds
  );
  const toggleKeeplistActive = useAppStore(
    (state) => state.toggleKeeplistActive
  );

  const systemKeeplists = keeplists.filter((kl) => kl.isSystem);
  const userKeeplists = keeplists.filter((kl) => !kl.isSystem);

  const isActive = (id: string) => {
    if (activeKeeplistIds.length === 0) return true;
    return activeKeeplistIds.includes(id);
  };

  const activeCount =
    activeKeeplistIds.length === 0
      ? keeplists.length
      : activeKeeplistIds.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-100">Active Keeplists</h3>
        <span className="text-sm text-slate-400">
          {activeCount} of {keeplists.length} active
        </span>
      </div>

      <p className="text-sm text-slate-400">
        Toggle which keeplists appear in the main view. Disabled keeplists won't
        show their items.
      </p>

      {/* System Keeplists */}
      {systemKeeplists.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <List className="w-4 h-4" />
            System Keeplists
          </h4>
          <div className="space-y-1">
            {systemKeeplists
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((keeplist) => (
                <button
                  key={keeplist.id}
                  onClick={() => toggleKeeplistActive(keeplist.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(keeplist.id)
                      ? "bg-blue-600/20 border border-blue-500/50"
                      : "bg-slate-800 border border-slate-700 opacity-60"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isActive(keeplist.id)
                        ? "bg-blue-500 border-blue-500"
                        : "border-slate-600"
                    }`}
                  >
                    {isActive(keeplist.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="flex-1 text-left text-sm">
                    {keeplist.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {keeplist.items.length} items
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* User Keeplists */}
      {userKeeplists.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <List className="w-4 h-4" />
            Your Keeplists
          </h4>
          <div className="space-y-1">
            {userKeeplists.map((keeplist) => (
              <button
                key={keeplist.id}
                onClick={() => toggleKeeplistActive(keeplist.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(keeplist.id)
                    ? "bg-green-600/20 border border-green-500/50"
                    : "bg-slate-800 border border-slate-700 opacity-60"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    isActive(keeplist.id)
                      ? "bg-green-500 border-green-500"
                      : "border-slate-600"
                  }`}
                >
                  {isActive(keeplist.id) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="flex-1 text-left text-sm">
                  {keeplist.name}
                </span>
                <span className="text-xs text-slate-500">
                  {keeplist.items.length} items
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {userKeeplists.length === 0 && (
        <p className="text-sm text-slate-500 italic">
          No custom keeplists yet. Create one from the Keeplists menu.
        </p>
      )}
    </div>
  );
}
