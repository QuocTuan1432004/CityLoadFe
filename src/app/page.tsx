"use client";

import dynamic from "next/dynamic";

// Import Map component với SSR disabled vì Leaflet cần window object
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-200 animate-pulse rounded-lg"></div>
  ),
});

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Bản Đồ Địa Giới Thành Phố Hồ Chí Minh
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Hệ thống thông tin quy hoạch đô thị
          </p>
        </div>

        {/* Map Container */}
        <div className="mb-8">
          <Map />
        </div>

        {/* Info Panel */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              📍 Địa giới hành chính
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Hiển thị ranh giới các quận, huyện trên địa bàn TP.HCM
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              🏗️ Khu vực quy hoạch
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Thông tin về các khu vực quy hoạch đô thị và phát triển
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              📊 Dữ liệu GeoJSON
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Sử dụng dữ liệu địa lý chuẩn GeoJSON để hiển thị bản đồ
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Hướng dẫn sử dụng
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Click vào các khu vực trên bản đồ để xem thông tin chi tiết</li>
            <li>Sử dụng chuột để phóng to/thu nhỏ và di chuyển bản đồ</li>
            <li>
              Dữ liệu GeoJSON mẫu có thể được thay thế bằng dữ liệu thực tế
            </li>
            <li>
              Thêm file GeoJSON vào thư mục{" "}
              <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                /public/data/
              </code>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
