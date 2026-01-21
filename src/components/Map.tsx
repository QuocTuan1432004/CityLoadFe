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
import { useEffect, useState } from "react";
import type { FeatureCollection, Feature } from "geojson";
import L from "leaflet";
import * as esri from "esri-leaflet";
import SearchBar from "./SearchBar";
import MapLegend from "./MapLegend";
import MapControls from "./MapControls";

const { BaseLayer, Overlay } = LayersControl;

// Component cho Vietnam Labels overlay
function VietnamLabelsLayer() {
  const map = useMap();

  useEffect(() => {
    const labelsLayer = esri.tiledMapLayer({
      url: "https://tiles.arcgis.com/tiles/EaQ3hSM51DBnlwMq/arcgis/rest/services/VietnamLabels/MapServer",
      pane: "overlayPane",
    });

    labelsLayer.addTo(map);

    return () => {
      map.removeLayer(labelsLayer);
    };
  }, [map]);

  return null;
}

// Component wrapper để tích hợp với LayersControl
function VietnamLabelsOverlay() {
  return <VietnamLabelsLayer />;
}

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

    // Tìm kiếm district phù hợp CHÍNH XÁC
    const searchLower = searchQuery.toLowerCase().trim();
    const found = districtData.features.find((feature) => {
      const name = feature.properties?.shapeName?.toLowerCase().trim() || "";
      // Chỉ match khi tên khớp chính xác
      return name === searchLower;
    });

    if (found) {
      onHighlight(found);
      
      // Xử lý zoom và focus cho cả Polygon và MultiPolygon
      const geometry = found.geometry;
      let allCoords: number[][] = [];

      if (geometry.type === "Polygon") {
        // Polygon đơn giản
        allCoords = geometry.coordinates[0];
      } else if (geometry.type === "MultiPolygon") {
        // MultiPolygon (cho đảo và quần đảo)
        // Lấy tất cả coordinates từ tất cả các polygon
        geometry.coordinates.forEach((polygon) => {
          allCoords = allCoords.concat(polygon[0]);
        });
      }

      if (allCoords.length > 0) {
        // Tính bounding box để fit tất cả các đảo
        const lats = allCoords.map((c) => c[1]);
        const lngs = allCoords.map((c) => c[0]);
        
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        // Tạo bounds và fit map vào bounds này
        const bounds: L.LatLngBoundsExpression = [
          [minLat, minLng],
          [maxLat, maxLng],
        ];

        // FitBounds với padding để không bị cắt góc
        map.flyToBounds(bounds, {
          padding: [50, 50],
          duration: 1.5,
          maxZoom: 11,
        });
      }
    } else {
      onHighlight(null);
    }
  }, [searchQuery, districtData, map, onHighlight]);

  return null;
}

export default function Map() {
  const [districtData, setDistrictData] = useState<FeatureCollection | null>(
    null,
  );
  const [provinceData, setProvinceData] = useState<FeatureCollection | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedFeature, setHighlightedFeature] = useState<Feature | null>(
    null,
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Tọa độ trung tâm Việt Nam
  const vietnamCenter: [number, number] = [16.0, 106.0];

  useEffect(() => {
    // Fix cho Leaflet icon trong Next.js
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

  const onEachDistrictFeature = (feature: Feature, layer: L.Layer) => {
    if (feature.properties) {
      const popupContent = `
        <div>
          <h3 class="font-bold">${feature.properties.shapeName || "Không rõ"}</h3>
          <p class="text-xs text-gray-600">Cấp: Quận/Huyện</p>
          <p class="text-xs text-blue-600 mt-1">Double-click để xem chi tiết</p>
        </div>
      `;
      layer.bindPopup(popupContent);

      // Handle double-click event
      layer.on("dblclick", () => {
        handleSuggestionClick(feature);
      });
    }
  };

  const districtStyle = (feature?: Feature) => {
    const isHighlighted =
      highlightedFeature &&
      feature?.properties?.shapeID === highlightedFeature.properties?.shapeID;

    return {
      color: isHighlighted ? "#fbbf24" : "#fc26ee",
      weight: isHighlighted ? 3 : 1,
      opacity: isHighlighted ? 1 : 0.6,
      fillColor: isHighlighted ? "#fde047" : "#ffb5fa",
      fillOpacity: isHighlighted ? 0.5 : 0.15,
    };
  };

  const handleSearchQuery = (query: string) => {
    setSearchQuery(query);
  };

  const handleSuggestionClick = (feature: Feature) => {
    const name = feature.properties?.shapeName || "";
    setSearchQuery(name);
  };

  const handleSidebarToggle = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  // Tìm tỉnh/thành phố chứa quận/huyện dựa trên tọa độ
  const findProvinceForDistrict = (districtFeature: Feature): Feature | null => {
    if (!provinceData || !districtFeature.geometry) return null;

    // Lấy tọa độ trung tâm của district (hỗ trợ cả Polygon và MultiPolygon)
    const districtGeom = districtFeature.geometry as any;
    let testPoints: [number, number][] = [];

    if (districtGeom.type === "Polygon" && districtGeom.coordinates?.[0]) {
      const coords = districtGeom.coordinates[0];
      const lats = coords.map((c: number[]) => c[1]);
      const lngs = coords.map((c: number[]) => c[0]);
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      testPoints.push([centerLng, centerLat]);
    } else if (districtGeom.type === "MultiPolygon" && districtGeom.coordinates) {
      // Với MultiPolygon, lấy trung tâm của từng polygon để test
      districtGeom.coordinates.forEach((polygon: number[][][]) => {
        if (polygon[0]) {
          const coords = polygon[0];
          const lats = coords.map((c: number[]) => c[1]);
          const lngs = coords.map((c: number[]) => c[0]);
          const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
          const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
          testPoints.push([centerLng, centerLat]);
        }
      });
    }

    if (testPoints.length === 0) return null;

    // Tìm province chứa ít nhất một trong các điểm test (hỗ trợ cả Polygon và MultiPolygon)
    for (const province of provinceData.features) {
      const provinceGeom = province.geometry as any;
      
      if (provinceGeom.type === "Polygon") {
        for (const point of testPoints) {
          if (isPointInPolygon(point, provinceGeom.coordinates[0])) {
            return province;
          }
        }
      } else if (provinceGeom.type === "MultiPolygon") {
        // Kiểm tra từng polygon trong MultiPolygon
        for (const polygon of provinceGeom.coordinates) {
          for (const point of testPoints) {
            if (isPointInPolygon(point, polygon[0])) {
              return province;
            }
          }
        }
      }
    }

    return null;
  };

  // Helper function: kiểm tra điểm có nằm trong polygon không
  const isPointInPolygon = (point: number[], polygon: number[][]): boolean => {
    const [x, y] = point;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];

      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

      if (intersect) inside = !inside;
    }

    return inside;
  };

  // Lấy tất cả suggestions từ districtData
  const getAllSuggestions = (): Feature[] => {
    if (!districtData) return [];
    return districtData.features;
  };

  return (
    <div className="w-full h-screen relative">
      {/* Search Bar Component */}
      <SearchBar
        onSearch={handleSearchQuery}
        suggestions={getAllSuggestions()}
        onSuggestionClick={handleSuggestionClick}
      />

      {/* Map Legend Component */}
      <MapLegend />

      {/* Map Container - adjusts when sidebar is open */}
      <div
        className={`h-full transition-all duration-300 ${
          highlightedFeature
            ? isSidebarCollapsed
              ? "mr-10"
              : "mr-96"
            : "mr-0"
        }`}
      >
        <MapContainer
        center={vietnamCenter}
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <LayersControl position="topright">
          <BaseLayer checked name="Bản đồ đường phố">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
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
          <Overlay checked name="Nhãn Việt Nam">
            <VietnamLabelsOverlay />
          </Overlay>
        </LayersControl>

        <SearchController
          searchQuery={searchQuery}
          districtData={districtData}
          onHighlight={setHighlightedFeature}
        />
      </MapContainer>
      </div>

      {/* Map Controls Sidebar - fixed position */}
      <MapControls
        highlightedFeature={highlightedFeature}
        provinceFeature={
          highlightedFeature ? findProvinceForDistrict(highlightedFeature) : null
        }
        onToggle={handleSidebarToggle}
      />
    </div>
  );
}
