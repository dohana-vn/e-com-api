import { ShopeeModule } from '../../shopee';
import { TiktokModule } from '../../tiktokshops';
import { NhanhModule } from '../../nhanh';
import {
  BridgeShipOrderResult,
  BridgeShippingLabelResult,
  BridgeTrackingResult,
} from '../dto/fulfillment.dto';
import { OrderIdentifierService } from './order-identifier.service';

export interface BridgeFulfillmentServiceDependencies {
  identifierService: OrderIdentifierService;
  shopee?: ShopeeModule;
  tiktok?: TiktokModule;
  nhanh?: NhanhModule;
}

export class BridgeFulfillmentService {
  private identifier: OrderIdentifierService;
  private shopee?: ShopeeModule;
  private tiktok?: TiktokModule;
  private nhanh?: NhanhModule;

  constructor(deps: BridgeFulfillmentServiceDependencies) {
    this.identifier = deps.identifierService;
    this.shopee = deps.shopee;
    this.tiktok = deps.tiktok;
    this.nhanh = deps.nhanh;
  }

  setShopeeModule(shopee: ShopeeModule) {
    this.shopee = shopee;
  }

  setTiktokModule(tiktok: TiktokModule) {
    this.tiktok = tiktok;
  }

  setNhanhModule(nhanh: NhanhModule) {
    this.nhanh = nhanh;
  }

  /**
   * Mảng 2: Xác nhận gửi hàng / Chuẩn bị hàng (Ship Order)
   */
  async shipOrderByNhanhId(
    nhanhOrderId: string | number,
    options: { addressId?: number; timeSlot?: string } = {},
  ): Promise<BridgeShipOrderResult> {
    const meta = await this.identifier.identifyPlatformOrder(nhanhOrderId);

    if (meta.platform === 'SHOPEE') {
      if (!this.shopee) {
        throw new Error('ShopeeModule chưa được cấu hình để gửi lệnh ship.');
      }
      const res = await this.shopee.shipOrder(
        meta.platformOrderId,
        options.addressId || 0,
        options.timeSlot || '',
      );
      return {
        success: true,
        platform: 'SHOPEE',
        nhanhOrderId: meta.nhanhOrderId,
        platformOrderId: meta.platformOrderId,
        message: 'Đã bắn lệnh xác nhận chuẩn bị hàng lên Shopee thành công.',
        data: res,
      };
    }

    if (meta.platform === 'TIKTOK') {
      if (!this.tiktok) {
        throw new Error('TiktokModule chưa được cấu hình để gửi lệnh ship.');
      }
      const packageId = meta.platformPackageId || meta.platformOrderId;
      const res = await this.tiktok.shipPackage(packageId, {
        handover_method: 'PICKUP',
        pickup_slot: { start_time: 0, end_time: 0 },
      });
      return {
        success: true,
        platform: 'TIKTOK',
        nhanhOrderId: meta.nhanhOrderId,
        platformOrderId: meta.platformOrderId,
        message: 'Đã bắn lệnh ship kiện hàng lên TikTok Shop thành công.',
        data: res,
      };
    }

    return {
      success: false,
      platform: 'NHANH',
      nhanhOrderId: meta.nhanhOrderId,
      platformOrderId: meta.platformOrderId,
      message: `Đơn ${meta.nhanhOrderId} thuộc kênh ${meta.channelName}, không hỗ trợ bắn lệnh ship qua API sàn TMĐT.`,
    };
  }

  /**
   * Mảng 2: Lấy URL file in tem dán gói hàng (Shipping Label)
   */
  async getShippingLabelByNhanhId(nhanhOrderId: string | number): Promise<BridgeShippingLabelResult> {
    const meta = await this.identifier.identifyPlatformOrder(nhanhOrderId);

    if (meta.platform === 'SHOPEE') {
      if (!this.shopee) {
        throw new Error('ShopeeModule chưa được cấu hình để lấy nhãn in Shopee.');
      }
      const res = await this.shopee.getBatchShippingDocuments([
        { order_sn: meta.platformOrderId },
      ]);

      if (res.type === 'URL') {
        return {
          platform: 'SHOPEE',
          nhanhOrderId: meta.nhanhOrderId,
          platformOrderId: meta.platformOrderId,
          printStatus: 'READY',
          documentUrl: res.url,
          fileType: res.format,
          message: `Đã lấy link tem in Shopee thành công (${res.format}).`,
        };
      }

      if (res.type === 'BUFFER') {
        return {
          platform: 'SHOPEE',
          nhanhOrderId: meta.nhanhOrderId,
          platformOrderId: meta.platformOrderId,
          printStatus: 'READY',
          fileType: res.format,
          message: `Đã tải file tem in nhị phân (${res.file.filename}).`,
        };
      }

      return {
        platform: 'SHOPEE',
        nhanhOrderId: meta.nhanhOrderId,
        platformOrderId: meta.platformOrderId,
        printStatus: 'FAILED',
        message: res.reason || 'Shopee chưa có chứng từ in cho đơn hàng này.',
      };
    }

    if (meta.platform === 'TIKTOK') {
      if (!this.tiktok) {
        throw new Error('TiktokModule chưa được cấu hình để lấy nhãn in TikTok.');
      }
      const packageId = meta.platformPackageId || meta.platformOrderId;
      const res = await this.tiktok.getShippingDocumentUrl(packageId);

      return {
        platform: 'TIKTOK',
        nhanhOrderId: meta.nhanhOrderId,
        platformOrderId: meta.platformOrderId,
        printStatus: 'READY',
        documentUrl: res.url,
        fileType: res.format,
        message: 'Đã lấy link tem in TikTok Shop thành công.',
      };
    }

    if (this.nhanh) {
      await this.nhanh.getShippingDocument(meta.rawNhanhOrder);
    }

    return {
      platform: 'NHANH',
      nhanhOrderId: meta.nhanhOrderId,
      platformOrderId: meta.platformOrderId,
      printStatus: 'RAW_DATA',
      message: 'Đơn hàng Nhanh.vn nội bộ, sử dụng mẫu in nhiệt tiêu chuẩn A6 của hệ thống kho.',
    };
  }

  /**
   * Mảng 2: Lấy mã vận đơn và trạng thái giao hàng thực tế (Tracking Info)
   */
  async getTrackingInfoByNhanhId(nhanhOrderId: string | number): Promise<BridgeTrackingResult> {
    const meta = await this.identifier.identifyPlatformOrder(nhanhOrderId);

    if (meta.platform === 'SHOPEE') {
      if (!this.shopee) {
        throw new Error('ShopeeModule chưa được cấu hình để tra cứu tracking.');
      }
      const trackingRes = await this.shopee.getTrackingNumber(meta.platformOrderId);
      const trackingNumber =
        trackingRes?.response?.tracking_number || meta.carrierCode || 'Chưa có mã vận đơn';
      const carrierName = trackingRes?.response?.shipping_carrier;
      const status = trackingRes?.response?.logistics_status || 'READY_TO_SHIP';

      return {
        platform: 'SHOPEE',
        nhanhOrderId: meta.nhanhOrderId,
        platformOrderId: meta.platformOrderId,
        trackingNumber,
        carrierName,
        status,
      };
    }

    if (meta.platform === 'TIKTOK') {
      if (!this.tiktok) {
        throw new Error('TiktokModule chưa được cấu hình để tra cứu tracking.');
      }
      const packageId = meta.platformPackageId || meta.platformOrderId;
      const detail = await this.tiktok.getPackageDetail(packageId);
      const pkg = (detail as any)?.data;
      const trackingNumber = pkg?.tracking_number || meta.carrierCode || 'Chưa có mã vận đơn';

      return {
        platform: 'TIKTOK',
        nhanhOrderId: meta.nhanhOrderId,
        platformOrderId: meta.platformOrderId,
        trackingNumber,
        carrierName: pkg?.shipping_provider_name,
        status: pkg?.package_status || 'TO_FULFILL',
      };
    }

    return {
      platform: 'NHANH',
      nhanhOrderId: meta.nhanhOrderId,
      platformOrderId: meta.platformOrderId,
      trackingNumber: meta.carrierCode || 'Chưa phát sinh vận đơn',
      carrierName: meta.rawNhanhOrder?.carrier?.name || 'Vận chuyển nội bộ',
      status: 'Đang lưu kho / vận chuyển nội bộ',
    };
  }
}
