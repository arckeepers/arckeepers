import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Alpha-hijack: capture a-z keys globally and focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only capture single letter keys a-z
      if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        // Don't interfere if user is typing in an input or textarea
        const target = e.target as HTMLElement;
        const isInputField =
          target.tagName === "TEXTAREA" ||
          (target.tagName === "INPUT" &&
            (target as HTMLInputElement).type !== "button" &&
            (target as HTMLInputElement).type !== "submit");

        // If already in the search input, let it work normally
        if (target === inputRef.current) {
          return;
        }

        // If in another input field, don't hijack
        if (isInputField) {
          return;
        }

        // Focus search bar and append the character
        e.preventDefault();
        inputRef.current?.focus();
        onChange(value + e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [value, onChange]);

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div className="sticky top-[65px] z-40 bg-slate-900 py-3 px-4">
      <div className="max-w-4xl mx-auto relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search items... (just start typing)"
          className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
