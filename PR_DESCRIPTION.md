# 🚀 PR: Triển khai tính năng In phiếu vận chuyển theo từng module sàn (Shopee, TikTok, Nhanh.vn)

## 📌 Tóm tắt ngắn gọn
Pull Request này triển khai trọn vẹn giải pháp in phiếu vận chuyển (Shipping Label) **chuẩn 100% theo kiến trúc module gốc của codebase**:
- **Không dùng Switch-Case tập trung**, xóa bỏ hoàn toàn thư mục `src/common/`.
- **Mỗi sàn độc lập (Modular SDK):** Toàn bộ hàm in ấn, kiểm tra điều kiện in, gộp kiện, chia mẻ được đặt trực tiếp trong module của từng sàn (`src/module/shopee`, `src/module/tiktokshops`, `src/module/nhanh`).
- **Phía Backend (BE chính):** Làm việc trực tiếp với module của sàn tương ứng (`ShopeeModule`, `TiktokModule`, `NhanhModule`).

---

## 🛠️ Chi tiết triển khai theo từng module

### 1. Module Shopee (`src/module/shopee/`)
* **Logic Helper (`src/module/shopee/common/shipping-print.helper.ts`):**
  * `isShopeeOrderPrintable`: Kiểm tra điều kiện đơn Shopee được phép in (`PROCESSED`, `RETRY_SHIP`, có mã vận đơn).
  * `chunkShopeePrintOrders`: Tự động gom theo Shop ID và cắt nhỏ mảng đơn thành các mẻ tối đa 50 đơn/lần (chuẩn trần của Shopee).
  * `partitionShopeeDocumentResult`: Phân loại kết quả Shopee thành 3 nhóm rõ ràng (`readyOrders`, `failedOrders`, `processingOrders`).
  * `detectDownloadedDocumentFormat`: Quét mã Magic Bytes (`%PDF`, `PK`, `^XA`) nhận diện chính xác định dạng file nhị phân tải về.
* **API In mẻ hoàn chỉnh (`src/module/shopee/api/logistic.api.ts`):**
  * `fetchShopeeBatchShippingDocuments` (alias `getBatchShippingDocuments`): Gửi lệnh in mẻ ➔ Polling chờ Shopee render (tự ngắt khi sai token) ➔ Tải file ➔ Quét Magic Bytes ➔ Gọi hook `uploadFile` (S3/MinIO nếu BE cấu hình).
* **ShopeeModule (`src/module/shopee/index.ts`):**
  * Bổ sung method: `shopee.getBatchShippingDocuments(orders, options)`
  * Bổ sung method: `shopee.isOrderPrintable(order, allowReprint)`

### 2. Module TikTok Shop (`src/module/tiktokshops/`)
* **Logic Helper (`src/module/tiktokshops/common/shipping-print.helper.ts`):**
  * `isTiktokOrderPrintable`: Kiểm tra điều kiện đơn TikTok (`AWAITING_COLLECTION`, `PARTIALLY_SHIPPING`, chặn đơn FBT).
  * `dedupeTiktokPackages`: Lọc trùng kiện hàng khi nhiều đơn gộp chung 1 kiện (`packageId`), đảm bảo máy in chỉ nhả ra **đúng 1 phiếu in**, chống lãng phí giấy.
* **API In (`src/module/tiktokshops/api/v2/fulfillment.api.ts`):**
  * `fetchTiktokShippingDocumentUrl` (alias `getShippingDocumentUrl`): Lấy link URL tải tem in theo `packageId` (hỗ trợ `PDF`, `PNG`, `ZPL`).
* **TiktokModule (`src/module/tiktokshops/index.ts`):**
  * Bổ sung method: `tiktok.getShippingDocumentUrl(packageId, options)`
  * Bổ sung method: `tiktok.isOrderPrintable(order, allowReprint)`

### 3. Module Nhanh.vn (`src/module/nhanh/`)
* **Logic Helper (`src/module/nhanh/common/shipping-print.helper.ts`):**
  * `isNhanhOrderPrintable`: Kiểm tra trạng thái đơn Nhanh và mã vận đơn `carrierCode`. Phân luồng đơn sàn (uỷ quyền in qua Shopee/TikTok) vs đơn bán lẻ (in khổ A6).
* **NhanhModule (`src/module/nhanh/index.ts`):**
  * Bổ sung method: `nhanh.isOrderPrintable(order, options)`

---

## 🧪 Kết quả Kiểm thử (Unit Tests)
Đã tổ chức lại bộ test độc lập theo từng sàn tại thư mục `test/`:
* `test/shopee-shipping-print.test.mjs`: Test Shopee batch size, polling, partition, format detection, order printable.
* `test/tiktok-shipping-print.test.mjs`: Test TikTok packageId validation, dedupe package, order printable rules.
* `test/nhanh-shipping-print.test.mjs`: Test Nhanh.vn order printable strategies.

👉 **Toàn bộ 13/13 tests đều chạy thành công (PASS 100%).**
