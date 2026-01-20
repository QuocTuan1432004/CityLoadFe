"use client";

import dynamic from "next/dynamic";

// Import Map component với SSR disabled vì Leaflet cần window object
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-gray-200 animate-pulse"></div>
  ),
});

export default function Home() {
  return (
    <div className="w-full h-screen">
      <Map />
    </div>
  );
}
