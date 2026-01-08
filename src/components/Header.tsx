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

function GitHubCorner() {
  return (
    <a
      href="https://github.com/arckeepers/arckeepers"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed top-0 right-0 z-[100] group"
      aria-label="Fork on GitHub"
    >
      <svg
        width="80"
        height="80"
        viewBox="0 0 250 250"
        className="fill-slate-700 text-slate-100 absolute top-0 right-0"
        aria-hidden="true"
      >
        <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z" />
        <path
          d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
          fill="currentColor"
          className="octo-arm origin-[130px_106px] group-hover:animate-[octocat-wave_560ms_ease-in-out]"
        />
        <path
          d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
          fill="currentColor"
          className="octo-body"
        />
      </svg>
    </a>
  );
}

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
      <GitHubCorner />
      <header className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <img
              src="/logo.svg"
              alt="Arc Keepers Logo"
              className="h-16 -mr-4 -mt-3 -mb-3"
            />
            <h1 className="text-lg sm:text-xl font-semibold text-slate-50">
              Arc Keepers
            </h1>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
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
