"use client";
import * as React from "react";

interface DashboardContextType {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const DashboardContext = React.createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <DashboardContext.Provider value={{ isMobileOpen, setIsMobileOpen, searchQuery, setSearchQuery }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = React.useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used within DashboardProvider");
  return context;
}
