"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// Create a simple context to pass search term to pages
const SearchContext = createContext<{
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}>({
  searchTerm: "",
  setSearchTerm: () => {},
});

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchTerm() {
  return useContext(SearchContext);
}

