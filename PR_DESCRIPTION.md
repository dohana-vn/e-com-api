# 🚀 PR: Triển khai tính năng In phiếu vận chuyển đa sàn (Shopee, TikTok, Nhanh.vn)

## 📌 Tóm tắt ngắn gọn
Pull Request này bổ sung trọn vẹn bộ tính năng in phiếu vận chuyển (Shipping Label) cho 3 sàn: **Shopee, TikTok Shop, Nhanh.vn**.
- **Phong cách code:** Sử dụng cấu trúc **Hàm thuần túy & Switch-Case (`*.api.ts`, `*.helper.ts`)** quen thuộc của repo, không dùng Class OOP phức tạp.
- **Phía Backend (BE chính):** Chỉ cần gọi đúng 1-2 hàm là xong, không cần quan tâm các bước phức tạp bên dưới.

---

## 🛠️ Danh sách chi tiết các hàm và ý nghĩa

### 1. Nhóm hàm Tiện ích & Xử lý nghiệp vụ (`src/common/shipping-print.helper.ts`)

| Tên hàm | Ý nghĩa & Nghiệp vụ giải quyết |
| :--- | :--- |
| **`isOrderPrintable`** | **"Người gác cổng" kiểm tra điều kiện in:**<br>• Chặn ngay các đơn đã Huỷ, Chưa thanh toán hoặc sàn chưa cấp Mã vận đơn.<br>• Phân luồng đơn Nhanh.vn: nếu đơn đồng bộ từ Shopee/TikTok thì uỷ quyền in qua sàn gốc, nếu là đơn bán lẻ tại shop thì in khổ A6. |
| **`dedupeTiktokPackages`** | **Chống in trùng lãng phí giấy của TikTok:**<br>• Khi khách mua 3 món ở 3 đơn khác nhau nhưng TikTok gom chung vào **1 kiện (`packageId`)**.<br>• Hàm này lọc bỏ các đơn trùng kiện, đảm bảo máy in chỉ nhả ra **đúng 1 phiếu in duy nhất**. |
| **`chunkShopeePrintOrders`** | **Cắt nhỏ mẻ in Shopee (Chống quá tải):**<br>• Quy định của Shopee chỉ cho in tối đa 50 đơn/lần. Nếu gửi 120 đơn sẽ bị lỗi ngay.<br>• Hàm này tự động chia 120 đơn thành các mẻ nhỏ (50 + 50 + 20) và gom nhóm theo từng Shop ID. |
| **`detectDownloadedDocumentFormat`** | **Soi "dấu vân tay" nhận diện đúng loại file:**<br>• Đọc mã nhị phân (Magic Bytes) đầu file để biết chính xác file tải về là gì:<br>  - `%PDF` ➔ File PDF<br>  - `PK` ➔ File nén ZIP<br>  - `^XA` ➔ Mã in nhiệt ZPL.<br>• Tránh trường hợp lưu sai đuôi file làm hỏng file khi mở. |
| **`partitionShopeeDocumentResult`** | **Phân loại kết quả in của Shopee:**<br>• Tách mảng kết quả của Shopee thành 3 nhóm rõ ràng: đơn in thành công (`readyOrders`), đơn in thất bại kèm lý do (`failedOrders`), và đơn sàn đang xử lý (`processingOrders`). |

---

### 2. Nhóm hàm Gọi API & Xử lý mạng (`src/common/shipping-print.api.ts`)

| Tên hàm | Ý nghĩa & Nghiệp vụ giải quyết |
| :--- | :--- |
| **`getShippingPrintDocument`** | **Cửa ngõ chính (Router Switch-Case duy nhất):**<br>• BE chỉ cần truyền `{ source: 'SHOPEE' \| 'TIKTOK' \| 'NHANH' }`.<br>• Hàm tự động điều hướng sang đúng hàm của sàn tương ứng để lấy file/link in về. |
| **`fetchTiktokShippingDocumentUrl`** | **Lấy link tải tem in TikTok:**<br>• Gọi API TikTok theo `packageId` để lấy trực tiếp URL file tem vận chuyển (PDF, PNG hoặc ZPL). |
| **`fetchShopeeBatchShippingDocuments`** | **Xử lý toàn bộ luồng in phức tạp của Shopee:**<br>• Gửi lệnh in mẻ lên Shopee.<br>• Tự động chạy vòng lặp **Polling (hỏi thăm định kỳ mỗi 1-2s)** chờ Shopee render xong file PDF.<br>• **Xử lý an toàn:** Nếu sai token thì dừng ngay; nếu không có đơn nào in được thì trả về `NO_DOCUMENT` chứ không tải file rỗng 0 bytes.<br>• Tự động kích hoạt Hook lưu trữ S3/MinIO nếu BE cấu hình. |

---

### 3. Tính năng mở rộng: Cổng cắm lưu trữ (`uploadFile` Hook)
Thư viện không ép buộc BE phải dùng AWS S3 hay bất kỳ đám mây nào:
- **Nếu BE truyền `uploadFile`:** Thư viện sẽ đưa file PDF vừa tải từ sàn cho BE tự upload lên S3/MinIO của công ty và trả về link `URL` cho máy in.
- **Nếu BE không truyền:** Thư viện trả về nguyên file nhị phân (`BUFFER`) cho BE tự lưu ổ cứng tuỳ ý.

---

## 🧪 Kết quả Kiểm thử (Unit Tests)
Đã viết đầy đủ **13/13 test cases** kiểm tra toàn bộ trường hợp biên (edge cases):
- ✅ Xác thực bắt buộc `packageId` của TikTok.
- ✅ Bắt lỗi khi gửi quá 50 đơn Shopee trong 1 mẻ.
- ✅ Kiểm tra điều kiện đơn in được / không in được cho từng sàn.
- ✅ Kiểm tra lọc trùng kiện hàng TikTok (`dedupeTiktokPackages`).
- ✅ Kiểm tra thuật toán cắt mẻ 50 đơn (`chunkShopeePrintOrders`).
- ✅ Kiểm tra soi mã Magic Bytes nhận diện PDF, ZIP, PNG, ZPL.
- ✅ Kiểm tra phân loại đơn thành công / thất bại của Shopee.

👉 **Toàn bộ 13/13 tests đều chạy thành công (PASS 100%).**
