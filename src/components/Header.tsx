import { useState, useRef } from "react";
import { Settings, Download, Upload, RotateCcw, Eye, EyeOff, List, X } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { KeeplistSelector } from "./KeeplistSelector";
import { UserKeeplistEditor } from "./UserKeeplistEditor";

type KeeplistPanelTab = "select" | "manage";

export function Header() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [keeplistPanelOpen, setKeeplistPanelOpen] = useState(false);
  const [keeplistTab, setKeeplistTab] = useState<KeeplistPanelTab>("select");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { settings, setShowCompleted, exportData, importData, resetToDefaults } =
    useAppStore();
  
  const activeCount = settings.activeKeeplistIds.length;

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arckeepers-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
      if (!success) {
        alert("Failed to import data. Please check the file format.");
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be imported again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    if (confirm("Reset all data to defaults? This cannot be undone.")) {
      resetToDefaults();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">
            AK
          </div>
          <h1 className="text-xl font-semibold text-slate-50">Arc Keepers</h1>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Keeplists Button */}
          <button
            onClick={() => setKeeplistPanelOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
            title="Manage keeplists"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Keeplists</span>
            {activeCount > 0 && (
              <span className="bg-blue-500 text-white text-xs px-1.5 rounded-full">
                {activeCount}
              </span>
            )}
          </button>

          {/* Show Completed Toggle */}
          <button
            onClick={() => setShowCompleted(!settings.showCompleted)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              settings.showCompleted
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
            title={settings.showCompleted ? "Hide completed items" : "Show completed items"}
          >
            {settings.showCompleted ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {settings.showCompleted ? "Showing All" : "Hiding Done"}
            </span>
          </button>

          {/* Settings Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {settingsOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setSettingsOpen(false)}
                />

                {/* Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-slate-700 rounded-lg shadow-xl border border-slate-600 z-20">
                  <button
                    onClick={() => {
                      handleExport();
                      setSettingsOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-slate-600 rounded-t-lg"
                  >
                    <Download className="w-4 h-4" />
                    Export Data
                  </button>

                  <label className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-slate-600 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Import Data
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </label>

                  <hr className="border-slate-600" />

                  <button
                    onClick={() => {
                      handleReset();
                      setSettingsOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-600 rounded-b-lg"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset to Defaults
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Keeplist Panel Modal */}
      {keeplistPanelOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setKeeplistPanelOpen(false)}
          />

          {/* Panel */}
          <div className="fixed inset-x-4 top-20 bottom-4 md:inset-auto md:right-4 md:top-20 md:w-96 md:max-h-[calc(100vh-6rem)] bg-slate-800 rounded-xl shadow-2xl border border-slate-700 z-50 flex flex-col overflow-hidden">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-slate-100">Keeplists</h2>
              <button
                onClick={() => setKeeplistPanelOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-700">
              <button
                onClick={() => setKeeplistTab("select")}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  keeplistTab === "select"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Active Lists
              </button>
              <button
                onClick={() => setKeeplistTab("manage")}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  keeplistTab === "manage"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                My Keeplists
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {keeplistTab === "select" ? (
                <KeeplistSelector />
              ) : (
                <UserKeeplistEditor />
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
