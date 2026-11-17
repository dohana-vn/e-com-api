# 🚀 PR: Triển khai tính năng In phiếu vận chuyển đa sàn (Shopee, TikTok, Nhanh.vn)

## 📌 Tóm tắt ngắn gọn
Pull Request này bổ sung trọn vẹn bộ tính năng in phiếu vận chuyển (Shipping Label) cho 3 sàn: **Shopee, TikTok Shop, Nhanh.vn**.
- **Phong cách code:** Tách biệt module độc lập (**Modular Design**). Mỗi sàn có file `shipping-print.helper.ts` riêng đặt trong thư mục của sàn đó.
- **Tầng dùng chung (`src/common/`):** Cung cấp bộ điều phối switch-case tổng hợp (`shipping-print.helper.ts` & `shipping-print.api.ts`).
- **Phía Backend (BE chính):** Chỉ cần gọi đúng 1-2 hàm là xong, không cần quan tâm các bước phức tạp bên dưới.

---

## 🛠️ Danh sách chi tiết các file và hàm

### 1. Nhóm Helper riêng theo từng sàn (High Modularity)

#### A. Shopee (`src/module/shopee/common/shipping-print.helper.ts`)
* **`checkShopeeEligibility`**: Kiểm tra điều kiện đơn Shopee được phép in (`PROCESSED`, `RETRY_SHIP`, có mã vận đơn).
* **`chunkShopeePrintOrders`**: Tự động gom theo Shop ID và cắt nhỏ mảng đơn thành các mẻ tối đa 50 đơn/lần (chuẩn Shopee Open API).
* **`partitionShopeeDocumentResult`**: Bóc tách danh sách kết quả Shopee thành 3 nhóm rõ ràng: đơn thành công (`readyOrders`), đơn thất bại kèm lý do (`failedOrders`), và đơn đang chờ sàn render (`processingOrders`).

#### B. TikTok Shop (`src/module/tiktokshops/common/shipping-print.helper.ts`)
* **`checkTiktokEligibility`**: Kiểm tra điều kiện in của TikTok (`AWAITING_COLLECTION`, `PARTIALLY_SHIPPING`, kiểm tra không phải đơn FBT).
* **`dedupeTiktokPackages`**: Lọc trùng kiện hàng TikTok khi nhiều đơn gộp chung 1 kiện (`packageId`), đảm bảo máy in chỉ nhả ra **đúng 1 phiếu in duy nhất**, chống lãng phí giấy.

#### C. Nhanh.vn (`src/module/nhanh/common/shipping-print.helper.ts`)
* **`checkNhanhEligibility`**: Kiểm tra trạng thái đơn Nhanh (`CONFIRMED`, `PACKING`, `PACKED`, `AWAITING_COLLECTION`) và mã vận đơn `carrierCode`. Phân luồng đơn sàn (uỷ quyền in qua Shopee/TikTok) vs đơn bán lẻ (in khổ A6).

---

### 2. Nhóm Điều phối & Gọi API dùng chung (`src/common/`)

#### A. Điều phối Logic (`src/common/shipping-print.helper.ts`)
* **`isOrderPrintable`**: Cửa ngõ kiểm tra đơn in tổng hợp, dùng switch-case gọi xuống đúng helper của từng sàn tương ứng.
* **`detectDownloadedDocumentFormat`**: Soi "dấu vân tay" nhị phân (Magic Bytes) đầu file (`%PDF` -> PDF, `PK` -> ZIP, `^XA` -> ZPL in nhiệt) để nhận diện chuẩn xác định dạng file tải về.

#### B. Gọi API & Mạng (`src/common/shipping-print.api.ts`)
* **`getShippingPrintDocument`**: Cửa ngõ lấy tài liệu in đa sàn (Router switch-case).
* **`fetchTiktokShippingDocumentUrl`**: Gọi API TikTok lấy link URL tải tem vận chuyển.
* **`fetchShopeeBatchShippingDocuments`**: Gửi lệnh in mẻ lên Shopee ➔ Polling chờ render ➔ Bắt lỗi token ➔ Tải file ➔ Quét Magic Bytes.
* **`uploadFile` Hook**: Cổng cắm callback linh hoạt để BE đẩy file lên S3/MinIO lấy link URL trực tiếp.

---

## 🧪 Kết quả Kiểm thử (Unit Tests)
Đã viết đầy đủ **13/13 test cases** kiểm tra toàn bộ luồng nghiệp vụ và trường hợp biên (edge cases).
👉 **Toàn bộ 13/13 tests đều chạy thành công (PASS 100%).**
