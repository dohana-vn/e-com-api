# 🚀 PR: Triển khai E-commerce Bridge Services & MCP Server đa sàn (Nhanh.vn, Shopee, TikTok Shop)

## 📌 Tóm tắt ngắn gọn
Pull Request này bổ sung tầng dịch vụ **Cầu nối đa sàn (E-commerce Bridge Services)** kết hợp cùng **Model Context Protocol (MCP) Server**.
Tính năng này cho phép nhân viên kho, CSKH và các trợ lý AI (như Antigravity IDE) chỉ cần tiếp nhận câu lệnh chat tiếng Việt tự nhiên (ví dụ: *"Kiểm tra đơn Nhanh NH8899"*, *"In tem cho đơn NH8899"*) để tự động nhận diện sàn và thực thi trực tiếp các thao tác trên Shopee hoặc TikTok Shop mà không cần mở cùng lúc 3 màn hình trình duyệt.

---

## 🌳 Kiến trúc Clean Architecture (Zero Redundancy - Không code trung gian)

Mã nguồn được tổ chức theo chuẩn **Clean Architecture / Domain-Driven Design (DDD)** và **Modern OOP (Dependency Injection & Adapter Pattern)**:

```text
src/module/bridge/
│
├── dto/                                  👈 Data Contracts (Types & Interfaces)
│   ├── order.dto.ts                      (IdentifiedOrder, BridgeOrderDetailResult, BridgeOrderItem)
│   ├── fulfillment.dto.ts                (BridgeShipOrderResult, BridgeShippingLabelResult, BridgeTrackingResult)
│   └── index.ts
│
├── services/                             👈 3 Domain Services chuyên biệt (Độc lập 100%)
│   ├── order-identifier.service.ts       (Nhận diện mã Nhanh ➔ Trả về sàn Shopee/TikTok/Nhanh)
│   ├── bridge-order.service.ts           (Chuyên mảng Order: Chi tiết món, giá tiền, địa chỉ)
│   ├── bridge-fulfillment.service.ts     (Chuyên mảng Fulfillment: Ship hàng, In tem PDF A6, Tracking)
│   └── index.ts
│
└── index.ts                              👈 Public API export ra toàn dự án
```

---

## 🛠️ Chi tiết các thành phần chính

### 1. `OrderIdentifierService`
- Làm sạch định dạng mã đơn Nhanh (hỗ trợ `"NH8899"`, `"nh 8899"`, hoặc `8899`).
- Truy vấn Nhanh.vn API để bóc tách `saleChannel` và mã sàn gốc:
  - `saleChannel = 42`: Đơn **Shopee** (lấy mã `order_sn` từ `channel.appOrderId`).
  - `saleChannel = 48`: Đơn **TikTok Shop** (lấy `order_id` và mã kiện `carrier.packageCode`).
  - Khác: Đơn bán lẻ nội bộ Nhanh.vn.

### 2. `BridgeOrderService`
- Cung cấp hàm `getOrderDetailByNhanhId(nhanhOrderId)`.
- Đóng vai trò **Adapter**: Chuẩn hóa dữ liệu trả về khác nhau giữa Shopee (`item_list`, `model_quantity_purchased`) và TikTok (`line_items`, `quantity`) về format chuẩn thống nhất `BridgeOrderDetailResult` cho AI.

### 3. `BridgeFulfillmentService`
- `shipOrderByNhanhId(nhanhOrderId)`: Bắn lệnh xác nhận chuẩn bị hàng lên Shopee/TikTok để shipper qua lấy.
- `getShippingLabelByNhanhId(nhanhOrderId)`: Tận dụng trực tiếp module In ấn từ PR trước, trả về link PDF tem in khổ A6 chính hãng sàn.
- `getTrackingInfoByNhanhId(nhanhOrderId)`: Tra cứu mã vận đơn (SPX, J&T...) và trạng thái giao hàng thực tế.

### 4. `MCP Server (mcp_server.js)`
- Đăng ký 4 công cụ chuẩn hóa cho AI:
  1. `ecom_get_order_detail`: Tra cứu chi tiết sản phẩm, giá tiền, địa chỉ từ mã đơn Nhanh.
  2. `ecom_ship_order`: Bắn lệnh ship đơn hàng lên sàn.
  3. `ecom_get_shipping_label`: Lấy link tải tem in PDF chuẩn.
  4. `ecom_get_tracking_info`: Tra cứu hành trình vận chuyển.
- Xử lý bất đồng bộ qua Stdio JSON-RPC 2.0. Bảo vệ tiến trình bằng `if (require.main === module)` giúp script có thể import độc lập để viết test.

---

## 🧪 Kết quả Kiểm thử (Unit Tests)

Chạy kiểm thử toàn bộ dự án với:
```bash
npm test
```

👉 **Kết quả: 22/22 tests PASS (100%)**
- 14 tests cũ của các module in ấn (Shopee, TikTok, Nhanh) giữ nguyên tính tương thích 100%.
- 8 tests mới cho `OrderIdentifierService`, `BridgeOrderService`, `BridgeFulfillmentService` và `MCP Server Tool Handlers`.
