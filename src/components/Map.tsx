"use client";

import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import type { FeatureCollection } from "geojson";

export default function Map() {
  const [isMounted, setIsMounted] = useState(false);
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);

  // Tọa độ trung tâm TP. Hồ Chí Minh
  const hcmCenter: [number, number] = [10.8231, 106.6297];

  useEffect(() => {
    setIsMounted(true);

    // Fix cho Leaflet icon trong Next.js
    const L = require("leaflet");
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/leaflet/marker-icon-2x.png",
      iconUrl: "/leaflet/marker-icon.png",
      shadowUrl: "/leaflet/marker-shadow.png",
    });

    // Load dữ liệu GeoJSON (placeholder - bạn cần thay bằng dữ liệu thực)
    // Trong production, load từ API hoặc file static
    const sampleData: FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            name: "Quận 1",
            planning_zone: "Trung tâm thương mại - Dịch vụ",
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [106.688, 10.7769],
                [106.708, 10.7769],
                [106.708, 10.7969],
                [106.688, 10.7969],
                [106.688, 10.7769],
              ],
            ],
          },
        },
        // Thêm các quận khác ở đây
      ],
    };

    setGeoData(sampleData);
  }, []);

  const onEachFeature = (feature: any, layer: any) => {
    if (feature.properties) {
      const popupContent = `
        <div>
          <h3 class="font-bold">${feature.properties.name || "Không rõ"}</h3>
          <p>Khu vực quy hoạch: ${feature.properties.planning_zone || "Chưa xác định"}</p>
        </div>
      `;
      layer.bindPopup(popupContent);
    }
  };

  const geoJSONStyle = () => {
    return {
      color: "#2563eb",
      weight: 2,
      opacity: 1,
      fillColor: "#3b82f6",
      fillOpacity: 0.3,
    };
  };

  // Chỉ render map khi component đã mounted ở client-side
  if (!isMounted) {
    return (
      <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg bg-gray-200 animate-pulse flex items-center justify-center">
        <p className="text-gray-600">Đang tải bản đồ...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={hcmCenter}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geoData && (
          <GeoJSON
            data={geoData}
            style={geoJSONStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  );
}
