import { createContext } from "react";

export interface StatusAnnouncerContextType {
  announce: (message: string, priority?: "polite" | "assertive") => void;
}

export const StatusAnnouncerContext = createContext<StatusAnnouncerContextType | null>(null);
