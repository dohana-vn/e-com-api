enum PRODUCT_TYPE {
  NORMAL = 1,
  VOUCHER = 2,
  WEIGHABLE = 3,
  IMEI = 4,
  BUNDLE = 5,
  SERVICE = 6,
  TOOL = 7,
  BATCH = 8,
  COMBO = 9,
  MULTI_UNIT = 10,
}

enum PRODUCT_STATUS {
  NEW = 1,
  ON_SALE = 2,
  STOP_SELLING = 3,
  OUT_OF_STOCK = 4,
}

enum PRICE_VAT_MODE {
  INCLUDED = 1,
  EXCLUDED = 2,
}

enum IMPORT_PRICE_VAT_MODE {
  INCLUDED = 1,
  EXCLUDED = 2,
}

enum PRODUCT_VAT {
  NON_TAXABLE = -1,
  NON_DECLARABLE = -2,
  ZERO_TAX = -100,
}

enum ORDER_SALE_CHANNEL {
  ADMIN = 1,
  WEBSITE = 2,
  API = 10,
  FACEBOOK = 20,
  INSTAGRAM = 21,
  LAZADA = 41,
  SHOPEE = 42,
  SENDO = 43,
  TIKI = 45,
  TIKTOK_SHOP = 48,
  ZALO_OA = 49,
  SHOPEE_CHAT = 50,
  LAZADA_CHAT = 51,
  ZALO_PERSONAL = 52,
}

enum ORDER_CARRIER {
  VIETTEL = 2,
  GIAO_HANG_NHANH = 5,
  GIAO_HANG_TIET_KIEM = 8,
  SELF_TRANSPORT = 12,
  AHAMOVE = 18,
  VIETNAM_POST = 22,
  JT_EXPRESS = 24,
  EMS = 25,
  BEST_EXPRESS = 26,
  NINJA_VAN = 27,
  SUPER_SHIP = 28,
  SPX = 29,
  LEX = 30,
  GRAB = 31,
}

enum ORDER_TYPE {
  HOME_DELIVERY = 1,
  IN_STORE_PURCHASE = 2,
  PRE_ORDER = 3,
  GIFT_REDEMPTION = 5,
  QUOTE_REQUEST = 10,
  PRODUCT_EXCHANGE = 12,
  CUSTOMER_RETURN = 14,
  WAREHOUSE_TRANSFER = 15,
  PARTIAL_RETURN = 16,
  LOST_COMPENSATION = 17,
}

enum ORDER_STATUS {
  PACKED = 40,               // Đã đóng gói
  PACKING = 42,              // Đang đóng gói
  AWAITING_COLLECTION = 43,  // Chờ thu gom
  NEW_ORDER = 54,            // Đơn mới
  CONFIRMING = 55,           // Đang xác nhận
  CONFIRMED = 56,            // Đã xác nhận
  AWAITING_CUSTOMER_CONFIRM = 57, // Chờ khách xác nhận
  CARRIER_CANCELLED = 58,    // Hãng vận chuyển hủy đơn
  SHIPPING = 59,             // Đang chuyển
  SUCCESS = 60,              // Thành công
  FAILED = 61,               // Thất bại
  CUSTOMER_CANCELLED = 63,   // Khách hủy
  SYSTEM_CANCELLED = 64,     // Hệ thống hủy
  OUT_OF_STOCK = 68,         // Hết hàng
  RETURNING = 71,            // Đang chuyển hoàn
  RETURNED = 72,             // Đã chuyển hoàn
  CHANGE_DELIVERY_DEPOT = 73, // Đổi kho xuất hàng
  RETURN_CONFIRMED = 74,     // Xác nhận hoàn
}

enum ORDER_REASON {
  WRONG_PRODUCT = 1,               // Đặt nhầm sản phẩm
  HIGH_SHIPPING_FEE = 2,           // Phí vận chuyển cao
  NO_BANK_TRANSFER = 3,            // Không muốn chuyển khoản
  DUPLICATE_ORDER = 4,             // Đơn trùng
  CANNOT_CONTACT_CUSTOMER = 5,     // Không gọi được khách
  OUT_OF_STOCK_REASON = 6,         // Hết hàng
  WAITING_TRANSFER = 8,            // Chờ chuyển khoản
  CUSTOMER_NOT_LIKE = 9,           // Khách không thích sản phẩm
  DISSATISFIED_CARRIER = 10,       // Khách không hài lòng về nhân viên vận chuyển
  SLOW_DELIVERY = 11,              // Giao hàng chậm
  BOUGHT_AT_STORE = 12,            // Đã mua sản phẩm tại cửa hàng
  WRONG_ADDRESS = 14,              // Sai địa chỉ người nhận
  CUSTOMER_NO_LONGER_WANT = 16,    // Khách không muốn mua nữa
  OTHER = 18,                      // Lý do khác
  CANNOT_CONTACT_SENDER = 19,      // Không liên hệ được với người gửi
  SELLER_NO_ONLINE = 20,           // Người gửi không bán hàng Online / Ngoại tỉnh
  SELLER_NOT_HANDOVER = 22,        // Người gửi không bàn giao hàng cho hãng vận chuyển
  CARRIER_PICKUP_LATE = 23,        // Hãng vận chuyển lấy hàng muộn
  WRONG_PICKUP_ADDRESS = 24,       // Sai địa chỉ kho lấy hàng
  CARRIER_LOST_GOODS = 25,         // Hãng vận chuyển làm mất hàng
  SELLER_SELF_TRANSPORT = 26,      // Người gửi tự vận chuyển
  SELLER_NOT_PROCESS = 29,         // Người gửi không xử lý đơn hàng
  WRONG_PRICE = 30,                // Sai giá sản phẩm
  CUSTOMER_AWAY = 35,              // Khách đi vắng (sẽ giao hàng vào hôm khác)
}

enum ORDER_STEP {
  CREATE_ORDER = 1,            // Tạo đơn hàng
  CONFIRM = 2,                 // Xác nhận
  PRINT_ORDER = 3,             // In đơn hàng
  SHIP = 4,                    // Vận chuyển
  EDIT_ORDER = 6,              // Sửa đơn hàng
  CHANGE_STATUS = 7,           // Đổi trạng thái
  SEND_TO_CARRIER = 8,         // Gửi đơn sang HVC
  UPDATE_TRANSFER_AMOUNT = 9,  // Cập nhật tiền chuyển khoản
  CHANGE_DEPOT = 10,           // Đổi kho hàng
  ADD_TO_HANDOVER = 11,        // Thêm đơn hàng vào biên bản
  REMOVE_FROM_HANDOVER = 12,   // Xóa đơn hàng khỏi biên bản
  CARRIER_UPDATE_STATUS = 13,  // HVC cập nhật trạng thái
  CHANGE_CARRIER = 14,         // Đổi hãng vận chuyển
  REQUEST_CARRIER_CANCEL = 15, // Báo hãng vận chuyển hủy
  CARRIER_RETURN_CODE = 16,    // HVC trả về mã code
  DELETE_ORDER = 17,           // Xóa đơn hàng
  RETURN_STATUS_WEIGHT = 18,   // Trả về trạng thái và khối lượng
  ADD_ORDER_NOTE = 19,         // Thêm nội dung đơn hàng
  API_UPDATE_ORDER = 20,       // API cập nhật đơn hàng
  CARRIER_RECEIVED = 21,       // HVC đã nhận hàng
  MERGE_ORDER = 22,            // Gộp đơn hàng
  MERGE_ORDER_ERROR = 23,      // Gộp đơn hàng (lỗi)
  SEND_TO_CARRIER_ERROR = 25,  // Gửi đơn sang HVC (lỗi)
  CHANGE_CARRIER_CODE = 26,    // Thay đổi mã vận đơn HVC
  GET_CARRIER_STATUS = 27,     // Lấy trạng thái từ HVC
  HANDOVER_CHANGE_STATUS = 28, // Đổi trạng thái từ biên bản bàn giao
  TOUR_TO_HANDOVER = 29,       // Chuyển từ Tour sang biên bản
  CARRIER_CANCEL_ERROR = 30,   // Lỗi hủy đơn HVC
  CARRIER_TRACKING_ERROR = 31, // Lỗi lấy lịch trình từ HVC
  OVERWEIGHT = 32,             // Vượt cân
  RECONCILIATION_ERROR = 33,   // Đối soát lỗi
  IMPORT_ORDER = 34,           // Import đơn hàng
  IMPORT_ORDER_STATUS = 35,    // Import trạng thái đơn hàng
  RECONCILING = 36,            // Đang đối soát
  RECONCILED = 37,             // Đã đối soát
  CREATE_RETAIL_INVOICE = 38,  // Tạo hóa đơn bán lẻ
  TO_WHOLESALE = 39,           // Chuyển đơn hàng sang bán sỉ
  WAREHOUSE_TRANSFER_ORDER = 40, // Đơn hàng chuyển kho
  COPY_ORDER = 41,             // Copy đơn hàng
  PACK = 42,                   // Đóng gói
  UPDATE_PACKER = 43,          // Cập nhật nhân viên đóng gói
  CREATE_PARTIAL_DELIVERY = 44, // Tạo đơn giao hàng một phần
  REMOVE_FROM_TOUR = 45,       // Xóa đơn hàng khỏi tour
  CREATE_PAYMENT_LINK = 46,    // Tạo link thanh toán
  CREATE_EXPORT_VOUCHER = 47,  // Tạo phiếu xuất kho
  CREATE_IMPORT_VOUCHER = 48,  // Tạo phiếu nhập kho
  DELETE_EXPORT_VOUCHER = 49,  // Xóa phiếu xuất kho
  DELETE_IMPORT_VOUCHER = 50,  // Xóa phiếu nhập kho
  SEND_TO_VPAGE = 51,          // Gửi thông tin sang Vpage
  UNLINK_TRANSFER = 52,        // Hủy ghép nối giao dịch chuyển khoản
  IMPORT_RETURN_STOCK = 53,    // Nhập hoàn kho
  SPLIT_ORDER = 54,            // Tách đơn hàng
  MULTI_POINT_DELIVERY = 55,   // Gửi hàng đa điểm
  EDIT_COD = 56,               // Sửa COD
  UPDATE_SALESPERSON = 57,     // Cập nhật nhân viên bán hàng
  CREATE_E_INVOICE = 58,       // Tạo hóa đơn điện tử
}

enum INVENTORY_TYPE {
  IMPORT = 1,  // Loại nhập kho
  EXPORT = 2,  // Loại xuất kho
}

enum INVENTORY_MODE {
  DELIVERY = 1,                // Kiểu giao hàng
  RETAIL = 2,                  // Kiểu bán lẻ
  WAREHOUSE_TRANSFER = 3,      // Kiểu chuyển kho
  RETAIL_INVOICE_GIFT = 4,     // Kiểu quà tặng ở hóa đơn bán lẻ
  SUPPLIER = 5,                // Kiểu nhà cung cấp
  WHOLESALE = 6,               // Kiểu bán sỉ
  STOCK_CHECK = 8,             // Kiểu kiểm kho
  OTHER = 10,                   // Kiểu khác
  WARRANTY_VOUCHER = 13,       // Kiểu phiếu bảo hành
  WARRANTY_CENTER = 14,        // Kiểu trung tâm bảo hành
  REPAIR_VOUCHER = 15,         // Kiểu phiếu sửa chữa
  WARRANTY_COMPONENT = 16,     // Kiểu linh kiện bảo hành
  WHOLESALE_INVOICE_GIFT = 17, // Kiểu quà tặng ở hóa đơn bán sỉ
  ORDER_GIFT = 18,             // Kiểu quà tặng ở đơn hàng
  COMBO = 19,                  // Kiểu Combo
}

enum INVENTORY_RELATED_TYPE {
  BUSINESS_SALE_EXPORT = 1,       // Xuất bán giữa 2 doanh nghiệp
  BUSINESS_PURCHASE_IMPORT = 2,   // Nhập giữa 2 doanh nghiệp
  RETAIL_INVOICE_GIFT_EXPORT = 3, // Xuất quà tặng cho hóa đơn bán lẻ
  ORDER_GIFT_EXPORT = 4,          // Xuất quà tặng cho đơn hàng
  WHOLESALE_GIFT_EXPORT = 5,      // Xuất quà tặng bán sỉ
  RETAIL_WHOLESALE_RETURN = 6,    // Nhập trả lại bán lẻ, bán sỉ
  WAREHOUSE_TRANSFER = 7,         // Nhập xuất chuyển kho
  COMBO = 8,                      // Nhập xuất combo
}

enum ACCOUNTING_TYPE {
  DEBIT = 1,          // Báo nợ (Rút tiền)
  CREDIT = 2,         // Báo có (Nộp tiền)
  RECEIPT = 3,         // Phiếu thu
  PAYMENT = 4,         // Phiếu chi
  RETURN_SLIP = 5,     // Phiếu trả hàng
  SALE_SLIP = 6,       // Phiếu bán hàng
  OTHER = 7,           // Khác
  IMPORT_SLIP = 8,     // Phiếu nhập
  EXPORT_SLIP = 9,     // Phiếu xuất
  TRANSFER = 12,       // Kết chuyển
}

enum ACCOUNTING_MODE {
  SUPPLIER_IMPORT = 1,                // Nhập nhà cung cấp
  SUPPLIER_RETURN_EXPORT = 2,         // Xuất trả nhà cung cấp
  SALE = 3,                            // Bán hàng
  RETURN = 4,                          // Hàng trả lại
  WHOLESALE = 5,                       // Bán sỉ
  WHOLESALE_RETURN = 6,                // Trả lại bán sỉ
  USED_DEVICE_IMPORT = 7,             // Nhập máy cũ
  WARRANTY = 8,                        // Bảo hành
  COMPONENT_EXPORT = 9,               // Xuất linh kiện
  FUND_TRANSFER = 15,                  // Chuyển quỹ
  INSTALLMENT_ACCOUNTING = 20,        // Hạch toán trả góp
  OPENING_DEBT = 21,                  // Công nợ đầu kì
  ORDER = 22,                          // Đơn hàng
  ORDER_RETURN = 23,                   // Đơn hàng trả lại
  SUPPLIER_IMPORT_VAT = 24,           // Nhập nhà cung cấp VAT
  SUPPLIER_EXPORT_VAT = 25,           // Xuất nhà cung cấp VAT
  OTHER_IMPORT_EXPORT = 26,           // XNK khác
  INSTALLMENT_COLLECTION = 27,        // Thu hộ trả góp
  IMPORT_VAT = 28,                     // Nhập VAT
  EXPORT_VAT = 29,                     // Xuất VAT
  CONFIRM_PAYMENT_RECEIVED = 30,      // Xác nhận nhận tiền thanh toán
  CONFIRM_PAYMENT_SHIPPING = 31,      // Xác nhận chi tiền thanh toán vận chuyển
  GIFT_IMPORT = 32,                    // Phiếu nhập quà tặng
  GIFT_EXPORT = 33,                    // Phiếu xuất quà tặng
}

enum ECOMMERCE_APP_ID {
  LAZADA = 8142,
  SHOPEE = 8195,
  SENDO = 8237,
  TIKI = 8238,
  TIKTOK = 8855,
}

const END_POINT = 'https://nhanh.vn';
const V3_END_POINT = 'https://pos.open.nhanh.vn/v3.0';

enum PATH {
  AUTHORIZED_SHOP = '/app/getaccesstoken',
  GENERATE_AUTH_LINK = '/oauth',
  PRODUCT_LIST = '/product/list',
  ORDER_LIST = '/order/list',
}

export {
  PRODUCT_TYPE as NHANH_PRODUCT_TYPE,
  PRODUCT_STATUS as NHANH_PRODUCT_STATUS,
  PRICE_VAT_MODE as NHANH_PRICE_VAT_MODE,
  IMPORT_PRICE_VAT_MODE as NHANH_IMPORT_PRICE_VAT_MODE,
  PRODUCT_VAT as NHANH_PRODUCT_VAT,
  ORDER_SALE_CHANNEL as NHANH_ORDER_SALE_CHANNEL,
  ORDER_CARRIER as NHANH_ORDER_CARRIER,
  ORDER_TYPE as NHANH_ORDER_TYPE,
  ORDER_STATUS as NHANH_ORDER_STATUS,
  ORDER_REASON as NHANH_ORDER_REASON,
  ORDER_STEP as NHANH_ORDER_STEP,
  INVENTORY_TYPE as NHANH_INVENTORY_TYPE,
  INVENTORY_MODE as NHANH_INVENTORY_MODE,
  INVENTORY_RELATED_TYPE as NHANH_INVENTORY_RELATED_TYPE,
  ACCOUNTING_TYPE as NHANH_ACCOUNTING_TYPE,
  ACCOUNTING_MODE as NHANH_ACCOUNTING_MODE,
  ECOMMERCE_APP_ID as NHANH_ECOMMERCE_APP_ID,
  PATH as NHANH_PATH,
  END_POINT as NHANH_END_POINT,
  V3_END_POINT as NHANH_V3_END_POINT,
};
