import { useState, useMemo, useRef, useEffect } from "react";
import { Plus, Trash2, Search, ChevronDown, ChevronRight, X } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { allItems, getItemByIdWithFallback } from "../data/allItems";
import { ConfirmDialog } from "./ConfirmDialog";
import { useConfirmDialog } from "../hooks/useConfirmDialog";

interface UserKeeplistEditorProps {
  onClose?: () => void;
}

export function UserKeeplistEditor({ onClose }: UserKeeplistEditorProps) {
  const keeplists = useAppStore((state) => state.keeplists);
  const createUserKeeplist = useAppStore((state) => state.createUserKeeplist);
  const deleteUserKeeplist = useAppStore((state) => state.deleteUserKeeplist);
  const addItemToKeeplist = useAppStore((state) => state.addItemToKeeplist);
  const removeItemFromKeeplist = useAppStore((state) => state.removeItemFromKeeplist);
  const updateKeeplistItemQty = useAppStore((state) => state.updateKeeplistItemQty);

  const userKeeplists = keeplists.filter((kl) => !kl.isSystem);
  const { confirm, dialogProps } = useConfirmDialog();

  const [newListName, setNewListName] = useState("");
  const [expandedLists, setExpandedLists] = useState<Set<string>>(
    new Set(userKeeplists.map((kl) => kl.id))
  );
  const [addingToList, setAddingToList] = useState<string | null>(null);
  const [itemSearch, setItemSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter available items for adding
  const filteredItems = useMemo(() => {
    if (!itemSearch.trim()) return allItems.slice(0, 20);
    const query = itemSearch.toLowerCase();
    return allItems
      .filter((item) => item.name.toLowerCase().includes(query))
      .slice(0, 20);
  }, [itemSearch]);

  // Reset highlighted index when search changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [itemSearch]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current) {
      const highlighted = listRef.current.querySelector('[data-highlighted="true"]');
      if (highlighted) {
        highlighted.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    const id = createUserKeeplist(newListName);
    if (id) {
      setExpandedLists((prev) => new Set([...prev, id]));
      setNewListName("");
      setCreateError(null);
    } else {
      setCreateError("A keeplist with this name already exists");
    }
  };

  const handleDeleteKeeplist = async (keeplistId: string, keeplistName: string) => {
    const confirmed = await confirm({
      title: "Delete Keeplist",
      message: `Are you sure you want to delete "${keeplistName}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      variant: "danger",
    });
    if (confirmed) {
      deleteUserKeeplist(keeplistId);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedLists((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent, keeplistId: string) => {
    const keeplist = userKeeplists.find((kl) => kl.id === keeplistId);
    if (!keeplist) return;

    const selectableItems = filteredItems.filter(
      (item) => !keeplist.items.some((i) => i.itemId === item.id)
    );

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < selectableItems.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (selectableItems[highlightedIndex]) {
          addItemToKeeplist(keeplistId, selectableItems[highlightedIndex].id, 1);
        }
        break;
      case "Escape":
        e.preventDefault();
        setAddingToList(null);
        setItemSearch("");
        break;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-100">Your Keeplists</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <p className="text-sm text-slate-400">
        Create custom keeplists to track items you need. These are stored locally.
      </p>

      {/* Create new keeplist */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={newListName}
            onChange={(e) => {
              setNewListName(e.target.value);
              setCreateError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
            placeholder="New keeplist name..."
            className={`flex-1 px-3 py-2 bg-slate-800 border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              createError ? "border-red-500" : "border-slate-700"
            }`}
          />
          <button
            onClick={handleCreateList}
            disabled={!newListName.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
        {createError && (
          <p className="text-sm text-red-400">{createError}</p>
        )}
      </div>

      {/* User keeplists */}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        {userKeeplists.length === 0 ? (
          <p className="text-center py-8 text-slate-500">
            No custom keeplists yet. Create one above!
          </p>
        ) : (
          userKeeplists.map((keeplist) => (
            <div
              key={keeplist.id}
              className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
            >
              {/* Keeplist header */}
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/80">
                <button
                  onClick={() => toggleExpanded(keeplist.id)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  {expandedLists.has(keeplist.id) ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>
                <span className="flex-1 font-medium">{keeplist.name}</span>
                <span className="text-sm text-slate-500">
                  {keeplist.items.length} items
                </span>
                <button
                  onClick={() => handleDeleteKeeplist(keeplist.id, keeplist.name)}
                  className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                  title="Delete keeplist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Keeplist items */}
              {expandedLists.has(keeplist.id) && (
                <div className="px-3 pb-3 space-y-2">
                  {keeplist.items.map((item) => {
                    const itemData = getItemByIdWithFallback(item.itemId);

                    return (
                      <div
                        key={item.itemId}
                        className="flex items-center gap-3 py-2 px-3 bg-slate-900/50 rounded-lg"
                      >
                        <span className="flex-1 text-sm">{itemData.name}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded rarity-${itemData.rarity.toLowerCase()}`}
                        >
                          {itemData.rarity}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-500">Need:</span>
                          <input
                            type="number"
                            min="0"
                            value={item.qtyRequired}
                            onChange={(e) =>
                              updateKeeplistItemQty(
                                keeplist.id,
                                item.itemId,
                                parseInt(e.target.value) || 0
                              )
                            }
                            title="Set to 0 for unlimited tracking"
                            className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-sm text-center"
                          />
                        </div>
                        <button
                          onClick={() => removeItemFromKeeplist(keeplist.id, item.itemId)}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Add item to list */}
                  {addingToList === keeplist.id ? (
                    <div className="mt-2 p-3 bg-slate-900 rounded-lg border border-slate-600">
                      <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value={itemSearch}
                          onChange={(e) => setItemSearch(e.target.value)}
                          onKeyDown={(e) => handleSearchKeyDown(e, keeplist.id)}
                          placeholder="Search items... (↑↓ navigate, Enter select)"
                          autoFocus
                          className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div ref={listRef} className="max-h-48 overflow-y-auto space-y-1">
                        {(() => {
                          let selectableIndex = 0;

                          return filteredItems.map((item) => {
                            const isDisabled = keeplist.items.some(
                              (i) => i.itemId === item.id
                            );
                            const currentSelectableIndex = isDisabled
                              ? -1
                              : selectableIndex++;
                            const isHighlighted =
                              !isDisabled && currentSelectableIndex === highlightedIndex;

                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  if (!isDisabled) {
                                    addItemToKeeplist(keeplist.id, item.id, 1);
                                  }
                                }}
                                disabled={isDisabled}
                                data-highlighted={isHighlighted}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded transition-colors ${
                                  isHighlighted
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-slate-800"
                                } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                              >
                                <span className="flex-1">{item.name}</span>
                                <span
                                  className={`text-xs ${
                                    isHighlighted
                                      ? "text-blue-200"
                                      : `rarity-${item.rarity.toLowerCase()}`
                                  }`}
                                >
                                  {item.rarity}
                                </span>
                              </button>
                            );
                          });
                        })()}
                      </div>
                      <button
                        onClick={() => {
                          setAddingToList(null);
                          setItemSearch("");
                        }}
                        className="mt-2 text-xs text-slate-500 hover:text-slate-300"
                      >
                        Cancel (Esc)
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingToList(keeplist.id)}
                      className="w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-900/50 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {onClose && (
        <div className="pt-2 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Done
          </button>
        </div>
      )}

      {/* Confirm Dialog */}
      {dialogProps && <ConfirmDialog {...dialogProps} />}
    </div>
  );
}
