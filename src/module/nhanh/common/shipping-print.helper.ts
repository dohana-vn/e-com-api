import {
  NHANH_ORDER_CARRIER,
  NHANH_ORDER_SALE_CHANNEL,
  NHANH_ORDER_STATUS,
} from './constant';

export const NHANH_ECOMMERCE_CHANNELS = new Set<number>([
  NHANH_ORDER_SALE_CHANNEL.SHOPEE,
  NHANH_ORDER_SALE_CHANNEL.TIKTOK_SHOP,
  NHANH_ORDER_SALE_CHANNEL.LAZADA,
]);

export interface NhanhPrintEligibilityCandidate {
  platformStatus: string | number;
  carrierId?: number;
  carrierCode?: string;
  nhanhSaleChannel?: number;
  nhanhAppOrderId?: string;
  hasLinkedPlatformShop?: boolean;
}

export interface NhanhPrintEligibilityOptions {
  allowReprint?: boolean;
  allowConfirmedWithoutCarrier?: boolean;
}

export interface NhanhPrintEligibilityResult {
  printable: boolean;
  isReprint?: boolean;
  recommendedStrategy?: 'SELF_RENDER_PDF' | 'PLATFORM_DELEGATION';
  reason?: string;
}

/**
 * Validate whether a Nhanh.vn order is ready for label printing.
 */
export function checkNhanhEligibility(
  order: NhanhPrintEligibilityCandidate,
  options: NhanhPrintEligibilityOptions = {},
): NhanhPrintEligibilityResult {
  const status = Number(order.platformStatus);
  const isPrimaryPrintable =
    status === NHANH_ORDER_STATUS.CONFIRMED ||
    status === NHANH_ORDER_STATUS.PACKING ||
    status === NHANH_ORDER_STATUS.PACKED ||
    status === NHANH_ORDER_STATUS.AWAITING_COLLECTION;
  const isReprint = Boolean(options.allowReprint) && status === NHANH_ORDER_STATUS.SHIPPING;

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
    (Boolean(options.allowConfirmedWithoutCarrier) && status === NHANH_ORDER_STATUS.CONFIRMED);

  if (!hasCarrierCode && !allowWithoutCarrier) {
    return {
      printable: false,
      reason: 'Nhanh.vn order is missing carrierCode',
    };
  }

  const isMarketplaceChannel =
    order.nhanhSaleChannel !== undefined && NHANH_ECOMMERCE_CHANNELS.has(order.nhanhSaleChannel);
  const shouldDelegateToPlatform =
    isMarketplaceChannel && Boolean(order.nhanhAppOrderId) && Boolean(order.hasLinkedPlatformShop);

  return {
    printable: true,
    isReprint,
    recommendedStrategy: shouldDelegateToPlatform ? 'PLATFORM_DELEGATION' : 'SELF_RENDER_PDF',
  };
}
