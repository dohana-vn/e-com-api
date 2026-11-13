import { PlatformPrintStrategy } from './platform-strategy.interface';
import {
  PrintEligibilityOptions,
  PrintEligibilityResult,
  PrintableOrderCandidate,
} from '../shipping-print.helper';
import {
  NHANH_ORDER_CARRIER,
  NHANH_ORDER_SALE_CHANNEL,
  NHANH_ORDER_STATUS,
} from '../../module/nhanh/common/constant';

export interface NhanhPrintRequest {
  source: 'NHANH';
  orderData?: any;
  message?: string;
}

export interface NhanhPrintResult {
  source: 'NHANH';
  type: 'RAW_DATA';
  orderData?: any;
  message: string;
}

const NHANH_ECOMMERCE_CHANNELS = new Set<number>([
  NHANH_ORDER_SALE_CHANNEL.SHOPEE,
  NHANH_ORDER_SALE_CHANNEL.TIKTOK_SHOP,
  NHANH_ORDER_SALE_CHANNEL.LAZADA,
]);

/**
 * Nhanh.vn printing strategy.
 * Nhanh.vn Open API does not offer a direct label generation endpoint;
 * this strategy provides validation and normalized raw order data for backend rendering.
 */
export class NhanhPrintStrategy
  implements PlatformPrintStrategy<NhanhPrintRequest, NhanhPrintResult>
{
  public readonly source = 'NHANH' as const;

  /**
   * Check if Nhanh.vn order is ready to print.
   */
  public isPrintable(
    order: PrintableOrderCandidate,
    options: PrintEligibilityOptions = {},
  ): PrintEligibilityResult {
    const status = Number(order.platformStatus);
    const isPrimaryPrintable =
      status === NHANH_ORDER_STATUS.CONFIRMED ||
      status === NHANH_ORDER_STATUS.PACKING ||
      status === NHANH_ORDER_STATUS.PACKED ||
      status === NHANH_ORDER_STATUS.AWAITING_COLLECTION;
    const isReprint =
      Boolean(options.allowReprint) && status === NHANH_ORDER_STATUS.SHIPPING;

    if (!isPrimaryPrintable && !isReprint) {
      return {
        printable: false,
        reason: 'Nhanh.vn order status is not ready for printing',
      };
    }

    const isSelfTransport = order.carrierId === NHANH_ORDER_CARRIER.SELF_TRANSPORT;
    const hasCarrierCode = Boolean(order.carrierCode);
    const allowWithoutCarrier =
      isSelfTransport ||
      (status === NHANH_ORDER_STATUS.CONFIRMED &&
        Boolean(options.allowConfirmedWithoutCarrier));

    if (!hasCarrierCode && !allowWithoutCarrier) {
      return {
        printable: false,
        reason: 'Nhanh.vn order has no carrier tracking code assigned yet',
      };
    }

    const isMarketplaceOrder =
      order.nhanhSaleChannel !== undefined &&
      NHANH_ECOMMERCE_CHANNELS.has(order.nhanhSaleChannel);

    if (isMarketplaceOrder && order.hasLinkedPlatformShop) {
      return {
        printable: true,
        isReprint,
        recommendedStrategy: 'PLATFORM_DELEGATION',
      };
    }

    return {
      printable: true,
      isReprint,
      recommendedStrategy: 'SELF_RENDER_PDF',
    };
  }

  /**
   * Return normalized raw data for backend A6 template drawing with pdfkit + bwip-js.
   */
  public async print(request: NhanhPrintRequest): Promise<NhanhPrintResult> {
    return {
      source: 'NHANH',
      type: 'RAW_DATA',
      orderData: request.orderData,
      message:
        request.message ||
        'Nhanh.vn Open API does not provide a direct print document endpoint. Render A6/A5 shipping label on backend with pdfkit + bwip-js using order data.',
    };
  }
}
