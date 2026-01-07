import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Store the previously focused element and focus the cancel button when opening
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      // Focus cancel button by default (safer option)
      cancelButtonRef.current?.focus();
    } else if (previousActiveElement.current) {
      // Restore focus when closing
      previousActiveElement.current.focus();
      previousActiveElement.current = null;
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  // Trap focus within the dialog
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements = [cancelButtonRef.current, confirmButtonRef.current].filter(Boolean);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const confirmButtonClasses =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-500 text-white"
      : variant === "warning"
      ? "bg-amber-600 hover:bg-amber-500 text-white"
      : "bg-blue-600 hover:bg-blue-500 text-white";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-slate-800 rounded-xl shadow-2xl border border-slate-700 z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700">
          {variant === "danger" && (
            <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
          )}
          {variant === "warning" && (
            <div className="w-10 h-10 rounded-full bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
          )}
          <h2
            id="confirm-dialog-title"
            className="flex-1 text-lg font-semibold text-slate-100"
          >
            {title}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-4">
          <p id="confirm-dialog-message" className="text-slate-300">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-4 py-3 bg-slate-800/50 border-t border-slate-700">
          <button
            ref={cancelButtonRef}
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg transition-colors ${confirmButtonClasses}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
