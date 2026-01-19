# Bản Đồ Địa Giới Thành Phố Hồ Chí Minh

Ứng dụng web hiển thị bản đồ địa giới hành chính TP. Hồ Chí Minh dành cho mục đích quy hoạch đô thị.

## 🚀 Công nghệ sử dụng

- **Next.js 16** - React framework với App Router
- **TypeScript** - Type safety
- **Leaflet** - Thư viện bản đồ mã nguồn mở
- **React-Leaflet** - React components cho Leaflet
- **Tailwind CSS** - Styling framework
- **GeoJSON** - Định dạng dữ liệu địa lý

## 📦 Cài đặt và chạy dự án

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Mở trình duyệt và truy cập [http://localhost:3000](http://localhost:3000) để xem kết quả.

## 🗂️ Cấu trúc dự án

```
febandodiagioi/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Trang chủ với bản đồ
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   └── components/
│       └── Map.tsx            # Component bản đồ Leaflet
├── public/
│   ├── data/
│   │   └── hcm-districts-sample.json  # Dữ liệu GeoJSON mẫu
│   └── leaflet/               # Leaflet marker icons
└── package.json
```

## 📍 Tính năng

- ✅ Hiển thị bản đồ tương tác của TP.HCM
- ✅ Hiển thị ranh giới các quận/huyện
- ✅ Popup thông tin khi click vào khu vực
- ✅ Dữ liệu GeoJSON có thể tùy chỉnh
- ✅ Responsive design
- ✅ Dark mode support

## 🔧 Tùy chỉnh dữ liệu bản đồ

### Thay đổi dữ liệu GeoJSON

1. Chuẩn bị file GeoJSON với dữ liệu địa giới thực tế của TP.HCM
2. Đặt file vào thư mục `public/data/`
3. Cập nhật component `Map.tsx` để load file mới:

```typescript
// Trong useEffect của src/components/Map.tsx
const response = await fetch("/data/your-geojson-file.json");
const data = await response.json();
setGeoData(data);
```

### Tùy chỉnh style bản đồ

Chỉnh sửa hàm `geoJSONStyle` trong `src/components/Map.tsx`:

```typescript
const geoJSONStyle = () => {
  return {
    color: "#2563eb", // Màu viền
    weight: 2, // Độ dày viền
    opacity: 1, // Độ mờ viền
    fillColor: "#3b82f6", // Màu tô
    fillOpacity: 0.3, // Độ mờ màu tô
  };
};
```

## 📝 Scripts

```bash
# Development
npm run dev

# Build production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## 🌐 Nguồn dữ liệu GeoJSON

Để có dữ liệu địa giới chính xác của TP.HCM, bạn có thể:

1. **OpenStreetMap**: Sử dụng [Overpass API](https://overpass-turbo.eu/)
2. **Cục Trắc Địa Bản Đồ Việt Nam**: Dữ liệu chính thức
3. **GADM**: [https://gadm.org/](https://gadm.org/) - Database địa giới hành chính
4. **GeoJSON.io**: [https://geojson.io/](https://geojson.io/) - Công cụ tạo/chỉnh sửa GeoJSON

## 🎨 Mở rộng chức năng

Bạn có thể thêm các tính năng sau:

- Filters để lọc các khu vực quy hoạch
- Legend giải thích màu sắc và ký hiệu
- Search box để tìm quận/huyện
- Layers control để bật/tắt các lớp bản đồ
- Thống kê dân số, diện tích theo khu vực

## 🚦 Lưu ý kỹ thuật

- Leaflet yêu cầu `window` object nên phải disable SSR cho Map component
- Sử dụng `'use client'` directive cho các component có tương tác
- Icons của Leaflet đã được copy vào `public/leaflet/`

## 📱 Responsive

Ứng dụng đã được tối ưu cho Desktop, Tablet và Mobile.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
