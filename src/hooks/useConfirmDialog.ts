import { useState, useCallback } from "react";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: "danger" | "warning" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function useConfirmDialog() {
  const [state, setState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions | null;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: null,
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setState((prev) => {
      prev.resolve?.(true);
      return { isOpen: false, options: null, resolve: null };
    });
  }, []);

  const handleCancel = useCallback(() => {
    setState((prev) => {
      prev.resolve?.(false);
      return { isOpen: false, options: null, resolve: null };
    });
  }, []);

  const dialogProps: ConfirmDialogProps | null = state.options
    ? {
        isOpen: state.isOpen,
        title: state.options.title,
        message: state.options.message,
        confirmLabel: state.options.confirmLabel ?? "Confirm",
        cancelLabel: state.options.cancelLabel ?? "Cancel",
        variant: state.options.variant ?? "default",
        onConfirm: handleConfirm,
        onCancel: handleCancel,
      }
    : null;

  return { confirm, dialogProps };
}
