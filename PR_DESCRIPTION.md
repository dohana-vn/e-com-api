# 🚀 PR: Triển khai tính năng In phiếu vận chuyển theo cấu trúc Module đồng nhất (Shopee, TikTok, Nhanh.vn)

## 📌 Tóm tắt ngắn gọn
Pull Request này chuẩn hóa tính năng in phiếu vận chuyển (Shipping Label) theo kiến trúc **Module đồng nhất ("Same-Same")**:
- **Không dùng Switch-Case tập trung**, xóa bỏ hoàn toàn thư mục `src/common/`.
- **Cấu trúc song song 100% ở cả 3 sàn:** Mỗi sàn đều sở hữu đúng 1 cặp file:
  * `api/shipping-print.api.ts`: Chuyên trách giao tiếp mạng, gọi API lấy file/URL in.
  * `common/shipping-print.helper.ts`: Chuyên trách logic nghiệp vụ, lọc đơn rác, chia mẻ, gộp kiện.
- **Phía Backend (BE chính):** Gọi hàm trực tiếp từ module của từng sàn (`ShopeeModule`, `TiktokModule`, `NhanhModule`).

---

## 🌳 Cây thư mục đồng nhất ("Same-Same") giữa các sàn

```text
src/module/
│
├── shopee/
│   ├── api/shipping-print.api.ts          👈 API in mẻ Shopee (Batch print, Polling, Timeout, Hook S3)
│   ├── common/shipping-print.helper.ts   👈 Helper Shopee (Lọc đơn, cắt mẻ 50, Magic Bytes)
│   └── index.ts                           👈 ShopeeModule (.getBatchShippingDocuments, .isOrderPrintable)
│
├── tiktokshops/
│   ├── api/shipping-print.api.ts          👈 API in TikTok (Lấy URL nhãn in PDF/PNG/ZPL)
│   ├── common/shipping-print.helper.ts   👈 Helper TikTok (Lọc đơn, gộp kiện chống in trùng)
│   └── index.ts                           👈 TiktokModule (.getShippingDocumentUrl, .isOrderPrintable)
│
└── nhanh/
    ├── api/shipping-print.api.ts          👈 API in Nhanh (Đóng gói RAW_DATA cho A6 thermal print)
    ├── common/shipping-print.helper.ts   👈 Helper Nhanh (Lọc đơn, phân loại đơn sàn vs bán lẻ)
    └── index.ts                           👈 NhanhModule (.getShippingDocument, .isOrderPrintable)
```

---

## 🛠️ Chi tiết các hàm trong từng module

### 1. Sàn Shopee (`src/module/shopee/`)
* **`api/shipping-print.api.ts`**:
  * `fetchShopeeBatchShippingDocuments`: Quy trình in mẻ chuẩn Production: Gửi lệnh tạo mẻ ➔ Polling chờ render (bắt lỗi token dừng ngay) ➔ Tải file ➔ Quét Magic Bytes ➔ Gọi hook `uploadFile` (S3/MinIO nếu BE cấu hình).
* **`common/shipping-print.helper.ts`**:
  * `isShopeeOrderPrintable`: Kiểm tra điều kiện đơn Shopee được phép in (`PROCESSED`, `RETRY_SHIP`, có mã vận đơn).
  * `chunkShopeePrintOrders`: Tự động gom theo Shop ID và cắt nhỏ mảng đơn thành các mẻ tối đa 50 đơn/lần (chuẩn Shopee Open API).
  * `partitionShopeeDocumentResult`: Phân loại kết quả Shopee (`readyOrders`, `failedOrders`, `processingOrders`).
  * `detectDownloadedDocumentFormat`: Quét mã nhị phân Magic Bytes (`%PDF`, `PK`, `^XA`) nhận diện file nhị phân.
* **`ShopeeModule` Methods**:
  * `shopee.getBatchShippingDocuments(orders, options)`
  * `shopee.isOrderPrintable(order, allowReprint)`

### 2. Sàn TikTok Shop (`src/module/tiktokshops/`)
* **`api/shipping-print.api.ts`**:
  * `fetchTiktokShippingDocumentUrl`: Lấy link URL tải tem in theo `packageId` (hỗ trợ `PDF`, `PNG`, `ZPL`).
* **`common/shipping-print.helper.ts`**:
  * `isTiktokOrderPrintable`: Kiểm tra điều kiện in TikTok (`AWAITING_COLLECTION`, `PARTIALLY_SHIPPING`, loại trừ FBT).
  * `dedupeTiktokPackages`: Lọc trùng kiện khi nhiều đơn gộp chung 1 kiện (`packageId`), đảm bảo máy in chỉ nhả ra **đúng 1 phiếu in**, chống lãng phí giấy.
* **`TiktokModule` Methods**:
  * `tiktok.getShippingDocumentUrl(packageId, options)`
  * `tiktok.isOrderPrintable(order, allowReprint)`

### 3. Sàn Nhanh.vn (`src/module/nhanh/`)
* **`api/shipping-print.api.ts`**:
  * `fetchNhanhShippingDocument`: Đóng gói dữ liệu đơn hàng dạng `RAW_DATA` để BE đưa vào template in nhiệt A6/A5.
* **`common/shipping-print.helper.ts`**:
  * `isNhanhOrderPrintable`: Kiểm tra trạng thái đơn Nhanh và mã vận đơn `carrierCode`. Phân luồng đơn sàn (uỷ quyền in qua Shopee/TikTok) vs đơn bán lẻ (in khổ A6).
* **`NhanhModule` Methods**:
  * `nhanh.getShippingDocument(orderData)`
  * `nhanh.isOrderPrintable(order, options)`

---

## 🧪 Kết quả Kiểm thử (Unit Tests)
Đã tổ chức lại bộ test độc lập tương ứng theo từng sàn tại thư mục `test/`:
* `test/shopee-shipping-print.test.mjs`
* `test/tiktok-shipping-print.test.mjs`
* `test/nhanh-shipping-print.test.mjs`

👉 **Toàn bộ 14/14 tests đều chạy thành công (PASS 100%).**
