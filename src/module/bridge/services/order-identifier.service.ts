import { NhanhModule, NHANH_ORDER_SALE_CHANNEL } from '../../nhanh';
import { IdentifiedOrder } from '../dto/order.dto';

export class OrderIdentifierService {
  constructor(private nhanh?: NhanhModule) {}

  setNhanhModule(nhanh: NhanhModule) {
    this.nhanh = nhanh;
  }

  /**
   * Nhận diện mã Nhanh.vn thuộc sàn nào (Shopee, TikTok, Nhanh) và trích xuất mã định danh sàn gốc
   */
  async identifyPlatformOrder(nhanhOrderIdInput: string | number): Promise<IdentifiedOrder> {
    if (!this.nhanh) {
      throw new Error('NhanhModule chưa được cấu hình trong OrderIdentifierService.');
    }

    const cleaned = String(nhanhOrderIdInput ?? '').trim();
    const numericStr = cleaned.replace(/\D/g, '');
    const numericId = Number(numericStr);

    if (!numericId || Number.isNaN(numericId)) {
      throw new Error(`Mã đơn Nhanh không hợp lệ: "${nhanhOrderIdInput}". Vui lòng nhập mã dạng NH8899 hoặc 8899.`);
    }

    const res = await this.nhanh.getOrderList({
      filters: { ids: [numericId] }
    });

    const order = res?.data?.[0];
    if (!order) {
      throw new Error(`Không tìm thấy đơn hàng Nhanh ID: ${numericId} trên hệ thống Nhanh.vn.`);
    }

    const saleChannel = order.channel?.saleChannel;
    const appOrderId = String(order.channel?.appOrderId || '').trim();
    const packageCode = String(order.carrier?.packageCode || '').trim();
    const carrierCode = order.carrier?.carrierCode;

    // Shopee (SaleChannel = 42)
    if (saleChannel === NHANH_ORDER_SALE_CHANNEL.SHOPEE) {
      return {
        nhanhOrderId: numericId,
        platform: 'SHOPEE',
        platformOrderId: appOrderId,
        carrierCode,
        channelName: 'Shopee',
        rawNhanhOrder: order,
      };
    }

    // TikTok Shop (SaleChannel = 48)
    if (saleChannel === NHANH_ORDER_SALE_CHANNEL.TIKTOK_SHOP) {
      return {
        nhanhOrderId: numericId,
        platform: 'TIKTOK',
        platformOrderId: appOrderId,
        platformPackageId: packageCode || appOrderId,
        carrierCode,
        channelName: 'TikTok Shop',
        rawNhanhOrder: order,
      };
    }

    // Bán lẻ nội bộ / Website Nhanh
    return {
      nhanhOrderId: numericId,
      platform: 'NHANH',
      platformOrderId: String(numericId),
      carrierCode,
      channelName: 'Nhanh.vn (Đơn nội bộ / Website)',
      rawNhanhOrder: order,
    };
  }
}
