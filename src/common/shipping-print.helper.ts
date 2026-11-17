import {
  SHOPEE_LOGISTICS_STATUS,
  SHOPEE_SHIPPING_DOCUMENT_TYPE,
} from '../module/shopee/common/constant';
import { TiktokPackageStatus } from '../module/tiktokshops/dto/response/fulfillment.response';

// Re-export Shopee shipping print helpers & types
export {
  checkShopeeEligibility,
  chunkShopeePrintOrders,
  partitionShopeeDocumentResult,
  ShopeeChunkGroup,
  ShopeeResultPartition,
  ShopeePrintEligibilityCandidate,
  ShopeePrintEligibilityResult,
  SHOPEE_BLOCKED_LOGISTICS_STATUSES,
} from '../module/shopee/common/shipping-print.helper';

// Re-export TikTok shipping print helpers & types
export {
  checkTiktokEligibility,
  dedupeTiktokPackages,
  TiktokPackageDedupResult,
  TiktokPrintEligibilityCandidate,
  TiktokPrintEligibilityResult,
} from '../module/tiktokshops/common/shipping-print.helper';

// Re-export Nhanh.vn shipping print helpers & types
export {
  checkNhanhEligibility,
  NhanhPrintEligibilityCandidate,
  NhanhPrintEligibilityOptions,
  NhanhPrintEligibilityResult,
  NHANH_ECOMMERCE_CHANNELS,
} from '../module/nhanh/common/shipping-print.helper';

import { checkShopeeEligibility } from '../module/shopee/common/shipping-print.helper';
import { checkTiktokEligibility } from '../module/tiktokshops/common/shipping-print.helper';
import { checkNhanhEligibility } from '../module/nhanh/common/shipping-print.helper';

export type PrintSource = 'TIKTOK' | 'SHOPEE' | 'NHANH';

export type PrintStrategy =
  | 'DIRECT_LINK'
  | 'SHOPEE_BATCH_WORKER'
  | 'SELF_RENDER_PDF'
  | 'PLATFORM_DELEGATION';

export interface PrintableOrderCandidate {
  source: PrintSource;
  platformStatus: string | number;
  trackingNumber?: string;
  // TikTok fields
  packageId?: string;
  packageStatus?: TiktokPackageStatus | string;
  fulfillmentType?: number;
  deliveryOptionType?: number;
  // Shopee fields
  logisticsStatus?: SHOPEE_LOGISTICS_STATUS | string;
  packageNumber?: string;
  // Nhanh.vn fields
  carrierId?: number;
  carrierCode?: string;
  nhanhSaleChannel?: number;
  nhanhAppOrderId?: string;
  hasLinkedPlatformShop?: boolean;
}

export interface PrintEligibilityOptions {
  /** Allow reprinting orders that are already in transit / shipped. Defaults to false. */
  allowReprint?: boolean;
  /** Allow printing Nhanh CONFIRMED (56) orders even before carrierCode is assigned (internal packing slip). */
  allowConfirmedWithoutCarrier?: boolean;
}

export interface PrintEligibilityResult {
  printable: boolean;
  isReprint?: boolean;
  recommendedStrategy?: PrintStrategy;
  reason?: string;
}

/**
 * Determine whether a synced order should display the Print button and can be printed.
 * Simple, direct multi-platform router matching existing codebase conventions.
 */
export function isOrderPrintable(
  order: PrintableOrderCandidate,
  options: PrintEligibilityOptions = {},
): PrintEligibilityResult {
  const allowReprint = Boolean(options.allowReprint);
  switch (order.source) {
    case 'TIKTOK':
      return checkTiktokEligibility(order, allowReprint);
    case 'SHOPEE':
      return checkShopeeEligibility(order, allowReprint);
    case 'NHANH':
      return checkNhanhEligibility(order, options);
  }
}

export type DownloadedDocumentFormat = 'PDF' | 'ZIP' | 'PNG' | 'ZPL' | 'UNKNOWN';

/**
 * Detect actual binary format of downloaded shipping document via magic bytes.
 */
export function detectDownloadedDocumentFormat(
  bytes: Uint8Array,
): DownloadedDocumentFormat {
  if (!bytes || bytes.length < 2) {
    return 'UNKNOWN';
  }
  // %PDF
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  ) {
    return 'PDF';
  }
  // PK (ZIP archive)
  if (bytes[0] === 0x50 && bytes[1] === 0x4b) {
    return 'ZIP';
  }
  // PNG
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return 'PNG';
  }
  // ZPL (^XA)
  const headText = Buffer.from(bytes.subarray(0, Math.min(bytes.length, 64)))
    .toString('utf8')
    .trimStart();
  if (headText.startsWith('^XA')) {
    return 'ZPL';
  }

  return 'UNKNOWN';
}
