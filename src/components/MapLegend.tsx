"use client";

import { useState } from "react";

export default function MapLegend() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="absolute bottom-10 left-3 z-1000">
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <span className="text-sm font-semibold text-gray-800">
              Chú giải
            </span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-gray-500 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Content */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
            {/* Quận/Huyện */}
            <div className="flex items-center gap-3">
              <div className="shrink-0 w-8 h-6 border border-pink-600 bg-pink-100 rounded"></div>
              <span className="text-xs text-gray-700">Quận/Huyện</span>
            </div>

            {/* Khu vực được chọn */}
            <div className="flex items-center gap-3">
              <div className="shrink-0 w-8 h-6 border-2 border-yellow-500 bg-yellow-200 rounded"></div>
              <span className="text-xs text-gray-700">Khu vực được chọn</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
