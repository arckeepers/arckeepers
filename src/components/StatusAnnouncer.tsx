import { useState, useCallback, type ReactNode } from "react";
import { StatusAnnouncerContext } from "../contexts/StatusAnnouncerContext";

interface StatusAnnouncerProviderProps {
  children: ReactNode;
}

export function StatusAnnouncerProvider({ children }: StatusAnnouncerProviderProps) {
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");

  const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    if (priority === "assertive") {
      // Clear and re-set to ensure screen readers pick up the change
      setAssertiveMessage("");
      setTimeout(() => setAssertiveMessage(message), 50);
    } else {
      setPoliteMessage("");
      setTimeout(() => setPoliteMessage(message), 50);
    }
  }, []);

  return (
    <StatusAnnouncerContext.Provider value={{ announce }}>
      {children}
      
      {/* Screen reader only live regions */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </StatusAnnouncerContext.Provider>
  );
}
