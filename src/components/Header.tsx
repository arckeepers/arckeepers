import { useState, useRef } from "react";
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Eye,
  EyeOff,
  List,
  X,
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { KeeplistSelector } from "./KeeplistSelector";
import { UserKeeplistEditor } from "./UserKeeplistEditor";
import { ConfirmDialog } from "./ConfirmDialog";
import { useConfirmDialog } from "../hooks/useConfirmDialog";

type KeeplistPanelTab = "select" | "manage";

export function Header() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [keeplistPanelOpen, setKeeplistPanelOpen] = useState(false);
  const [keeplistTab, setKeeplistTab] = useState<KeeplistPanelTab>("select");
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { confirm, dialogProps } = useConfirmDialog();
  const {
    settings,
    setShowCompleted,
    setAnimationsEnabled,
    exportData,
    importData,
    resetToDefaults,
  } = useAppStore();

  const activeCount = settings.activeKeeplistIds.length;

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arckeepers-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
      if (!success) {
        setImportError("Failed to import data. Please check the file format.");
        // Clear error after 5 seconds
        setTimeout(() => setImportError(null), 5000);
      } else {
        setImportError(null);
        setSettingsOpen(false);
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be imported again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReset = async () => {
    setSettingsOpen(false);
    const confirmed = await confirm({
      title: "Reset to Defaults",
      message:
        "Reset all data to defaults? This will clear your progress and cannot be undone.",
      confirmLabel: "Reset",
      variant: "danger",
    });
    if (confirmed) {
      resetToDefaults();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <img
              src="/logo.svg"
              alt="ARC Keepers Logo"
              className="h-16 -mr-5 -mt-3 -mb-3"
            />
            <h1 className="text-3xl font-bold italic font-(family-name:Poppins)">
              ARC Keepers
            </h1>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Fork on GitHub Button */}
            <a
              href="https://github.com/arckeepers/arckeepers"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-sm bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
              title="Fork on GitHub"
            >
              <svg
                className="w-4 h-4 fill-current"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="hidden sm:inline">GitHub</span>
            </a>

            {/* Keeplists Button */}
            <button
              onClick={() => setKeeplistPanelOpen(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-sm bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
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
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-sm transition-colors ${
                settings.showCompleted
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
              title={
                settings.showCompleted
                  ? "Hide completed items"
                  : "Show completed items"
              }
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
                  <div className="absolute right-0 mt-2 w-48 bg-slate-700 rounded-lg shadow-xl border border-slate-600 z-20 overflow-hidden">
                    <div
                      onClick={() =>
                        setAnimationsEnabled(!settings.animationsEnabled)
                      }
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-slate-600 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={settings.animationsEnabled ?? true}
                        onChange={() => {}}
                        className="w-4 h-4 rounded border-slate-500 bg-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-700 pointer-events-none"
                      />
                      Animations
                    </div>

                    <hr className="border-slate-600" />

                    <button
                      onClick={() => {
                        handleExport();
                        setSettingsOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-slate-600 cursor-pointer"
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
                      onClick={handleReset}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-600 rounded-b-lg"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset to Defaults
                    </button>

                    {importError && (
                      <>
                        <hr className="border-slate-600" />
                        <div className="px-4 py-2 text-sm text-red-400 bg-red-900/20">
                          {importError}
                        </div>
                      </>
                    )}
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
                <h2 className="text-lg font-semibold text-slate-100">
                  Keeplists
                </h2>
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

      {/* Confirm Dialog */}
      {dialogProps && <ConfirmDialog {...dialogProps} />}
    </>
  );
}
