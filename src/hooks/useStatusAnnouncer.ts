import { useContext } from "react";
import { StatusAnnouncerContext } from "../contexts/StatusAnnouncerContext";

export function useStatusAnnouncer() {
  const context = useContext(StatusAnnouncerContext);
  if (!context) {
    throw new Error("useStatusAnnouncer must be used within a StatusAnnouncerProvider");
  }
  return context;
}
