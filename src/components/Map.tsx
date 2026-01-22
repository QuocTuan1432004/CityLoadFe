"use client";

import { useEffect, useState, useRef } from "react";
import type { FeatureCollection, Feature } from "geojson";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import SearchBar from "./SearchBar";
import MapLegend from "./MapLegend";
import InfoSidebar from "./InfoSidebar";
import MapStyleControls from "./MapStyleControls";

// Khởi tạo Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Goong Map Styles URLs
const GOONG_MAPTILES_KEY = process.env.NEXT_PUBLIC_GOONG_MAPTILES_KEY;

const GOONG_MAP_STYLES = {
  streets: `https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAPTILES_KEY}`,
  satellite: `https://tiles.goong.io/assets/goong_satellite.json?api_key=${GOONG_MAPTILES_KEY}`,
};

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
  const [currentStyle, setCurrentStyle] = useState<"streets" | "satellite">("streets");
  const [showDistrictLayer, setShowDistrictLayer] = useState(true);
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const districtLayersAdded = useRef(false);

  // Tọa độ trung tâm Việt Nam
  const vietnamCenter: [number, number] = [106.0, 16.0]; // [lng, lat] cho Mapbox

  // Helper function: Add district layers to map
  const addDistrictLayers = (mapInstance: mapboxgl.Map, isVisible: boolean = true) => {
    if (!districtData) return;

    // Xóa layer và source cũ nếu có
    if (mapInstance.getLayer("districts-fill")) {
      mapInstance.removeLayer("districts-fill");
    }
    if (mapInstance.getLayer("districts-line")) {
      mapInstance.removeLayer("districts-line");
    }
    if (mapInstance.getLayer("districts-highlight")) {
      mapInstance.removeLayer("districts-highlight");
    }
    if (mapInstance.getLayer("districts-highlight-line")) {
      mapInstance.removeLayer("districts-highlight-line");
    }
    if (mapInstance.getSource("districts")) {
      mapInstance.removeSource("districts");
    }

    // Thêm GeoJSON source
    mapInstance.addSource("districts", {
      type: "geojson",
      data: districtData,
    });

    // Thêm fill layer (màu nền)
    mapInstance.addLayer({
      id: "districts-fill",
      type: "fill",
      source: "districts",
      layout: {
        visibility: isVisible ? "visible" : "none",
      },
      paint: {
        "fill-color": "#ffb5fa",
        "fill-opacity": 0.15,
      },
    });

    // Thêm line layer (viền)
    mapInstance.addLayer({
      id: "districts-line",
      type: "line",
      source: "districts",
      layout: {
        visibility: isVisible ? "visible" : "none",
      },
      paint: {
        "line-color": "#fc26ee",
        "line-width": 1,
        "line-opacity": 0.6,
      },
    });

    // Thêm highlight layer (sẽ filter sau)
    mapInstance.addLayer({
      id: "districts-highlight",
      type: "fill",
      source: "districts",
      layout: {
        visibility: isVisible ? "visible" : "none",
      },
      paint: {
        "fill-color": "#fde047",
        "fill-opacity": 0.5,
      },
      filter: ["==", "shapeID", ""],
    });

    mapInstance.addLayer({
      id: "districts-highlight-line",
      type: "line",
      source: "districts",
      layout: {
        visibility: isVisible ? "visible" : "none",
      },
      paint: {
        "line-color": "#fbbf24",
        "line-width": 3,
        "line-opacity": 1,
      },
      filter: ["==", "shapeID", ""],
    });

    // Click event cho districts
    mapInstance.on("click", "districts-fill", (e) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0] as any;
        handleSuggestionClick(feature);
      }
    });

    // Double click event cho districts
    mapInstance.on("dblclick", "districts-fill", (e) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0] as any;
        handleSuggestionClick(feature);
      }
    });

    // Thay đổi cursor khi hover
    mapInstance.on("mouseenter", "districts-fill", () => {
      mapInstance.getCanvas().style.cursor = "pointer";
    });

    mapInstance.on("mouseleave", "districts-fill", () => {
      mapInstance.getCanvas().style.cursor = "";
    });

    // Popup khi hover
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    mapInstance.on("mouseenter", "districts-fill", (e) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const coordinates = e.lngLat;
        const name = feature.properties?.shapeName || "Không rõ";

        popup
          .setLngLat(coordinates)
          .setHTML(
            `<div>
              <h3 class="font-bold">${name}</h3>
              <p class="text-xs text-gray-600">Cấp: Quận/Huyện</p>
              <p class="text-xs text-blue-600 mt-1">Double-click để xem chi tiết</p>
            </div>`
          )
          .addTo(mapInstance);
      }
    });

    mapInstance.on("mouseleave", "districts-fill", () => {
      popup.remove();
    });
  };

  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return; // Chỉ khởi tạo map một lần

    // Khởi tạo Mapbox map với Goong style
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: GOONG_MAP_STYLES.streets,
      center: vietnamCenter,
      zoom: 5.5,
    });

    // Thêm navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-left");

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

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Lắng nghe sự kiện style.load để re-add district layers khi đổi map style
  useEffect(() => {
    if (!map.current) return;

    const handleStyleLoad = () => {
      if (map.current && districtData && showDistrictLayer) {
        // Chỉ add layers khi showDistrictLayer === true
        addDistrictLayers(map.current, showDistrictLayer);
      }
    };

    map.current.on("style.load", handleStyleLoad);

    return () => {
      if (map.current) {
        map.current.off("style.load", handleStyleLoad);
      }
    };
  }, [districtData, showDistrictLayer]);

  // Vẽ layer Quận/Huyện bằng Mapbox khi districtData đã load
  useEffect(() => {
    if (!map.current || !districtData) return;
    
    const mapInstance = map.current;

    if (mapInstance.isStyleLoaded()) {
      addDistrictLayers(mapInstance, showDistrictLayer);
    } else {
      mapInstance.once("load", () => addDistrictLayers(mapInstance, showDistrictLayer));
    }
  }, [districtData, showDistrictLayer]);

  // Toggle visibility của district layer khi showDistrictLayer thay đổi
  useEffect(() => {
    if (!map.current) return;
    
    const mapInstance = map.current;
    const visibility = showDistrictLayer ? "visible" : "none";

    if (mapInstance.getLayer("districts-fill")) {
      mapInstance.setLayoutProperty("districts-fill", "visibility", visibility);
    }
    if (mapInstance.getLayer("districts-line")) {
      mapInstance.setLayoutProperty("districts-line", "visibility", visibility);
    }
    if (mapInstance.getLayer("districts-highlight")) {
      mapInstance.setLayoutProperty("districts-highlight", "visibility", visibility);
    }
    if (mapInstance.getLayer("districts-highlight-line")) {
      mapInstance.setLayoutProperty("districts-highlight-line", "visibility", visibility);
    }
  }, [showDistrictLayer]);

  // Update highlight khi highlightedFeature thay đổi
  useEffect(() => {
    if (!map.current) return;

    const mapInstance = map.current;

    // Đợi một chút để đảm bảo layers đã được add sau khi style.load
    const updateHighlight = () => {
      if (mapInstance.getLayer("districts-highlight")) {
        if (highlightedFeature) {
          const shapeID = highlightedFeature.properties?.shapeID || "";
          mapInstance.setFilter("districts-highlight", ["==", "shapeID", shapeID]);
          mapInstance.setFilter("districts-highlight-line", ["==", "shapeID", shapeID]);
        } else {
          mapInstance.setFilter("districts-highlight", ["==", "shapeID", ""]);
          mapInstance.setFilter("districts-highlight-line", ["==", "shapeID", ""]);
        }
      }
    };

    // Nếu map đang load style, đợi load xong rồi mới update
    if (mapInstance.isStyleLoaded()) {
      updateHighlight();
    } else {
      mapInstance.once("idle", updateHighlight);
    }
  }, [highlightedFeature]);

  // Handle search query và zoom
  useEffect(() => {
    if (!map.current || !searchQuery || !districtData) {
      if (!searchQuery) {
        setHighlightedFeature(null);
      }
      return;
    }

    const searchLower = searchQuery.toLowerCase().trim();
    const found = districtData.features.find((feature) => {
      const name = feature.properties?.shapeName?.toLowerCase().trim() || "";
      return name === searchLower;
    });

    if (found) {
      setHighlightedFeature(found);

      // Xử lý zoom và focus cho cả Polygon và MultiPolygon
      const geometry = found.geometry as any;
      let allCoords: number[][] = [];

      if (geometry.type === "Polygon") {
        allCoords = geometry.coordinates[0];
      } else if (geometry.type === "MultiPolygon") {
        geometry.coordinates.forEach((polygon: any) => {
          allCoords = allCoords.concat(polygon[0]);
        });
      }

      if (allCoords.length > 0) {
        const lngs = allCoords.map((c) => c[0]);
        const lats = allCoords.map((c) => c[1]);

        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);

        map.current.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          {
            padding: 50,
            duration: 1500,
            maxZoom: 11,
          }
        );
      }
    } else {
      setHighlightedFeature(null);
    }
  }, [searchQuery, districtData]);

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

  // Toggle map style giữa Streets và Satellite
  const toggleMapStyle = () => {
    if (!map.current) return;
    
    const newStyle = currentStyle === "streets" ? "satellite" : "streets";
    setCurrentStyle(newStyle);
    
    // Lưu center và zoom hiện tại
    const center = map.current.getCenter();
    const zoom = map.current.getZoom();
    
    // Đổi style
    map.current.setStyle(GOONG_MAP_STYLES[newStyle]);
    
    // Sau khi đổi style, giữ nguyên center và zoom
    map.current.once("style.load", () => {
      if (map.current) {
        map.current.setCenter(center);
        map.current.setZoom(zoom);
      }
    });
  };

  // Toggle district layer visibility
  const toggleDistrictLayer = () => {
    setShowDistrictLayer(!showDistrictLayer);
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

      {/* Map Style Controls - Top Right, adjusts when sidebar is open */}
      <div
        className={`absolute top-3 z-10 transition-all duration-300 ${
          highlightedFeature
            ? isSidebarCollapsed
              ? "right-13"
              : "right-100"
            : "right-3"
        }`}
      >
        <MapStyleControls
          currentStyle={currentStyle}
          showDistrictLayer={showDistrictLayer}
          onToggleStyle={toggleMapStyle}
          onToggleDistrictLayer={toggleDistrictLayer}
        />
      </div>

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
        <div ref={mapContainer} className="h-full w-full" />
      </div>

      {/* Info Sidebar - fixed position */}
      <InfoSidebar
        highlightedFeature={highlightedFeature}
        provinceFeature={
          highlightedFeature ? findProvinceForDistrict(highlightedFeature) : null
        }
        onToggle={handleSidebarToggle}
      />
    </div>
  );
}
