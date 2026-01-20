"use client";

import {
  MapContainer,
  TileLayer,
  GeoJSON,
  LayersControl,
  LayerGroup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useRef } from "react";
import type { FeatureCollection, Feature } from "geojson";
import L from "leaflet";

const { BaseLayer, Overlay } = LayersControl;

// Component để điều khiển map từ bên ngoài
function SearchController({
  searchQuery,
  districtData,
  onHighlight,
}: {
  searchQuery: string;
  districtData: FeatureCollection | null;
  onHighlight: (feature: Feature | null) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!searchQuery || !districtData) {
      onHighlight(null);
      return;
    }

    // Tìm kiếm district phù hợp
    const searchLower = searchQuery.toLowerCase();
    const found = districtData.features.find((feature) => {
      const name = feature.properties?.shapeName?.toLowerCase() || "";
      return name.includes(searchLower);
    });

    if (found && found.geometry.type === "Polygon") {
      onHighlight(found);
      // Tính center của polygon
      const coords = found.geometry.coordinates[0];
      const lats = coords.map((c) => c[1]);
      const lngs = coords.map((c) => c[0]);
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

      map.flyTo([centerLat, centerLng], 11, { duration: 1.5 });
    } else {
      onHighlight(null);
    }
  }, [searchQuery, districtData, map, onHighlight]);

  return null;
}

export default function Map() {
  const [provinceData, setProvinceData] = useState<FeatureCollection | null>(
    null,
  );
  const [districtData, setDistrictData] = useState<FeatureCollection | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [highlightedFeature, setHighlightedFeature] = useState<Feature | null>(
    null,
  );
  const [suggestions, setSuggestions] = useState<Feature[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Tọa độ trung tâm Việt Nam
  const vietnamCenter: [number, number] = [16.0, 106.0];

  useEffect(() => {
    // Fix cho Leaflet icon trong Next.js
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/leaflet/marker-icon-2x.png",
      iconUrl: "/leaflet/marker-icon.png",
      shadowUrl: "/leaflet/marker-shadow.png",
    });

    // Load dữ liệu tỉnh/thành phố
    fetch("/data/province_city_list.geojson")
      .then((res) => res.json())
      .then((data) => setProvinceData(data))
      .catch((error) => console.error("Error loading province data:", error));

    // Load dữ liệu quận/huyện
    fetch("/data/district_list.geojson")
      .then((res) => res.json())
      .then((data) => setDistrictData(data))
      .catch((error) => console.error("Error loading district data:", error));
  }, []);

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

  // Cập nhật suggestions khi searchInput thay đổi
  useEffect(() => {
    if (!searchInput.trim() || !districtData) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const searchLower = searchInput.toLowerCase();
    const filtered = districtData.features
      .filter((feature) => {
        const name = feature.properties?.shapeName?.toLowerCase() || "";
        return name.includes(searchLower);
      })
      .slice(0, 8); // Giới hạn 8 suggestions

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [searchInput, districtData]);

  const onEachProvinceFeature = (feature: Feature, layer: L.Layer) => {
    if (feature.properties) {
      const popupContent = `
        <div>
          <h3 class="font-bold text-lg">${feature.properties.shapeName || "Không rõ"}</h3>
          <p class="text-sm">Mã ISO: ${feature.properties.shapeISO || "N/A"}</p>
          <p class="text-xs text-gray-600">Cấp: Tỉnh/Thành phố</p>
        </div>
      `;
      layer.bindPopup(popupContent);
    }
  };

  const onEachDistrictFeature = (feature: Feature, layer: L.Layer) => {
    if (feature.properties) {
      const popupContent = `
        <div>
          <h3 class="font-bold">${feature.properties.shapeName || "Không rõ"}</h3>
          <p class="text-xs text-gray-600">Cấp: Quận/Huyện</p>
        </div>
      `;
      layer.bindPopup(popupContent);
    }
  };

  const provinceStyle = () => {
    return {
      color: "#dc2626",
      weight: 2,
      opacity: 0.8,
      fillColor: "#fca5a5",
      fillOpacity: 0.2,
    };
  };

  const districtStyle = (feature?: Feature) => {
    const isHighlighted =
      highlightedFeature &&
      feature?.properties?.shapeID === highlightedFeature.properties?.shapeID;

    return {
      color: isHighlighted ? "#fbbf24" : "#2563eb",
      weight: isHighlighted ? 3 : 1,
      opacity: isHighlighted ? 1 : 0.6,
      fillColor: isHighlighted ? "#fde047" : "#93c5fd",
      fillOpacity: isHighlighted ? 0.5 : 0.15,
    };
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (feature: Feature) => {
    const name = feature.properties?.shapeName || "";
    setSearchInput(name);
    setSearchQuery(name);
    setShowSuggestions(false);
  };

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg relative">
      {/* Search Bar */}
      <div
        ref={searchRef}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-md px-4"
      >
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-xl shadow-2xl p-3 backdrop-blur-sm"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Tìm kiếm: Quận 1, Thành phố Hồ Chí Minh..."
              className="flex-1 px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-sm hover:shadow-md"
            >
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </form>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="mt-2 bg-white rounded-lg shadow-xl border border-gray-100 max-h-64 overflow-y-auto">
            {suggestions.map((feature, index) => (
              <button
                key={feature.properties?.shapeID || index}
                type="button"
                onClick={() => handleSuggestionClick(feature)}
                className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-400"
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
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {feature.properties?.shapeName}
                  </p>
                  <p className="text-xs text-gray-500">Quận/Huyện</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <MapContainer
        center={vietnamCenter}
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <LayersControl position="topright">
          <BaseLayer checked name="Bản đồ đường phố">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>
          <BaseLayer name="Vệ tinh">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </BaseLayer>
          <BaseLayer name="Vệ tinh có nhãn">
            <LayerGroup>
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com">Esri</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com">Esri</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              />
            </LayerGroup>
          </BaseLayer>

          <Overlay checked name="Tỉnh/Thành phố">
            {provinceData && (
              <GeoJSON
                data={provinceData}
                style={provinceStyle}
                onEachFeature={onEachProvinceFeature}
              />
            )}
          </Overlay>

          <Overlay checked name="Quận/Huyện">
            {districtData && (
              <GeoJSON
                key={highlightedFeature?.properties?.shapeID || "districts"}
                data={districtData}
                style={districtStyle}
                onEachFeature={onEachDistrictFeature}
              />
            )}
          </Overlay>
        </LayersControl>

        <SearchController
          searchQuery={searchQuery}
          districtData={districtData}
          onHighlight={setHighlightedFeature}
        />
      </MapContainer>
    </div>
  );
}
