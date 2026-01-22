"use client";

import { useState } from "react";

interface InfoSidebarProps {
  highlightedFeature: any;
  provinceFeature: any;
  onToggle?: (collapsed: boolean) => void;
}

export default function InfoSidebar({
  highlightedFeature,
  provinceFeature,
  onToggle,
}: InfoSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!highlightedFeature) return null;

  const handleToggle = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onToggle) {
      onToggle(newCollapsedState);
    }
  };

  // Mock data - sẽ được thay thế bằng data thực từ API
  const stats = {
    totalHouses: Math.floor(Math.random() * 50000) + 10000,
    population: Math.floor(Math.random() * 500000) + 100000,
    area: (Math.random() * 50 + 10).toFixed(2),
    density: 0,
    infrastructurePressure: 0,
  };

  stats.density = Math.floor(stats.population / parseFloat(stats.area));
  stats.infrastructurePressure = Math.min(
    100,
    Math.floor((stats.density / 10000) * 100),
  );

  const getPressureColor = (pressure: number) => {
    if (pressure < 30) return "text-green-600 bg-green-100";
    if (pressure < 60) return "text-yellow-600 bg-yellow-100";
    if (pressure < 80) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getPressureLabel = (pressure: number) => {
    if (pressure < 30) return "Thấp";
    if (pressure < 60) return "Trung bình";
    if (pressure < 80) return "Cao";
    return "Rất cao";
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-white shadow-2xl transition-all duration-300 z-1000 ${
        isCollapsed ? "w-10" : "w-96"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 bg-white shadow-lg rounded-l-lg p-2 hover:bg-gray-50 transition-colors border border-r-0 border-gray-200"
        title={isCollapsed ? "Mở rộng" : "Thu gọn"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 text-gray-600 transition-transform ${
            isCollapsed ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Sidebar Content */}
      {!isCollapsed && (
        <div className="h-full overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-linear-to-r from-blue-600 to-blue-700 text-white p-4 shadow-md">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium uppercase tracking-wide opacity-90">
                  Thông tin khu vực
                </span>
              </div>
            </div>
            <h2 className="text-2xl font-bold">
              {highlightedFeature.properties?.shapeName || "Không rõ"}
            </h2>
            {provinceFeature && (
              <>
                <p className="text-sm text-blue-200 mt-2 border-t border-blue-400 pt-2">
                  Thuộc:
                </p>
                <p className="text-base text-blue-100 mt-1 inline-flex items-center gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-bold">
                    {provinceFeature.properties?.shapeName || "Không xác định"}
                  </span>
                </p>
              </>
            )}
          </div>

          {/* Stats Cards */}
          <div className="p-4 space-y-4">
            {/* Tổng số nhà */}
            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-medium">
                    Tổng số nhà
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalHouses.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Áp lực hạ tầng */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${getPressureColor(stats.infrastructurePressure)}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-medium">
                    Áp lực hạ tầng
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.infrastructurePressure}%
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      stats.infrastructurePressure < 30
                        ? "bg-green-500"
                        : stats.infrastructurePressure < 60
                          ? "bg-yellow-500"
                          : stats.infrastructurePressure < 80
                            ? "bg-orange-500"
                            : "bg-red-500"
                    }`}
                    style={{ width: `${stats.infrastructurePressure}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`font-medium px-2 py-1 rounded ${getPressureColor(stats.infrastructurePressure)}`}
                  >
                    {getPressureLabel(stats.infrastructurePressure)}
                  </span>
                  <span className="text-gray-500">Mức độ tải</span>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Thông tin bổ sung
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Loại hình</span>
                  <span className="font-medium text-gray-900">
                    Quận/Huyện
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Trung bình nhà/km²</span>
                  <span className="font-medium text-gray-900">
                    {Math.floor(
                      stats.totalHouses / parseFloat(stats.area),
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed State Icon */}
      {isCollapsed && (
        <div className="flex items-center justify-center h-full">
          <div className="transform -rotate-90 text-gray-400 text-xs font-medium tracking-wider text-nowrap">
            THÔNG TIN
          </div>
        </div>
      )}
    </div>
  );
}
