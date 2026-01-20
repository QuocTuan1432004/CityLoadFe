"use client";

import { useState, useEffect, useRef } from "react";
import type { Feature } from "geojson";

interface SearchBarProps {
  onSearch: (query: string) => void;
  suggestions: Feature[];
  onSuggestionClick: (feature: Feature) => void;
}

export default function SearchBar({
  onSearch,
  suggestions,
  onSuggestionClick,
}: SearchBarProps) {
  const [searchInput, setSearchInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Feature[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Đóng suggestions khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter suggestions based on input
  useEffect(() => {
    if (!searchInput.trim()) {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const searchLower = searchInput.toLowerCase();
    const filtered = suggestions.filter((feature) => {
      const name = feature.properties?.shapeName?.toLowerCase() || "";
      return name.includes(searchLower);
    });

    setFilteredSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [searchInput, suggestions]);

  const handleInputChange = (value: string) => {
    setSearchInput(value);
    onSearch(value);
  };

  const handleSuggestionSelect = (feature: Feature) => {
    const name = feature.properties?.shapeName || "";
    setSearchInput(name);
    onSuggestionClick(feature);
    setShowSuggestions(false);
  };

  return (
    <div
      ref={searchRef}
      className="absolute top-4 left-14 z-1000 w-full max-w-sm"
    >
      <div className="relative">
        {/* Input với icon tìm kiếm */}
        <div className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() =>
              filteredSuggestions.length > 0 && setShowSuggestions(true)
            }
            placeholder="Tìm kiếm quận, huyện..."
            className="w-full pl-11 pr-4 py-3 bg-white/95 backdrop-blur-md rounded-xl border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-lg text-sm"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="mt-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 max-h-80 overflow-y-auto">
            {filteredSuggestions.map((feature, index) => (
              <button
                key={feature.properties?.shapeID || index}
                type="button"
                onClick={() => handleSuggestionSelect(feature)}
                className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3 group"
              >
                <div className="shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {feature.properties?.shapeName}
                  </p>
                  <p className="text-xs text-gray-500">Quận/Huyện</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
