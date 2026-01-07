import { useState, useRef } from "react";
import { Settings, Download, Upload, RotateCcw, Eye, EyeOff } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

export function Header() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { settings, setShowCompleted, exportData, importData, resetToDefaults } =
    useAppStore();

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
    </header>
  );
}
