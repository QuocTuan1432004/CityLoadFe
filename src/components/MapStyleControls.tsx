"use client";

interface MapStyleControlsProps {
  currentStyle: "streets" | "satellite";
  showDistrictLayer: boolean;
  onToggleStyle: () => void;
  onToggleDistrictLayer: () => void;
}

export default function MapStyleControls({
  currentStyle,
  showDistrictLayer,
  onToggleStyle,
  onToggleDistrictLayer,
}: MapStyleControlsProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-2 space-y-2">
      {/* Button chuyển đổi bản đồ */}
      <button
        onClick={onToggleStyle}
        className="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded border border-gray-300 transition-colors flex items-center justify-center gap-2"
        title={
          currentStyle === "streets"
            ? "Chuyển sang Vệ tinh"
            : "Chuyển sang Đường phố"
        }
      >
        <span className="text-lg">
          {currentStyle === "streets" ? "🛰️" : "🗺️"}
        </span>
        <span className="text-sm">
          {currentStyle === "streets" ? "Vệ tinh" : "Đường phố"}
        </span>
      </button>

      {/* Button toggle layer Quận/Huyện */}
      <button
        onClick={onToggleDistrictLayer}
        className={`w-full font-semibold py-2 px-4 rounded border transition-colors flex items-center justify-center gap-2 ${
          showDistrictLayer
            ? "bg-pink-500 hover:bg-pink-600 text-white border-pink-600"
            : "bg-white hover:bg-gray-100 text-gray-800 border-gray-300"
        }`}
        title={showDistrictLayer ? "Ẩn Quận/Huyện" : "Hiện Quận/Huyện"}
      >
        <span className="text-sm">
          {showDistrictLayer ? "✓" : "○"}
        </span>
        <span className="text-sm">Quận/Huyện</span>
      </button>
    </div>
  );
}
