import {
  NHANH_ORDER_CARRIER,
  NHANH_ORDER_SALE_CHANNEL,
  NHANH_ORDER_STATUS,
} from '../module/nhanh/common/constant';
import {
  SHOPEE_LOGISTICS_STATUS,
  SHOPEE_ORDER_STATUS,
  SHOPEE_SHIPPING_DOCUMENT_TYPE,
  SHOPEE_STATUS_SHIPPING_DOCUMENT,
} from '../module/shopee/common/constant';
import { ShopeeShippingDocumentResultItem } from '../module/shopee/dto/response/logistic.reponse';
import { TIKTOK_ORDER_STATUS } from '../module/tiktokshops/common/constant';
import { TiktokPackageStatus } from '../module/tiktokshops/dto/response/fulfillment.response';

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

const SHOPEE_BLOCKED_LOGISTICS_STATUSES = new Set<string>([
  SHOPEE_LOGISTICS_STATUS.LOGISTICS_NOT_STARTED,
  SHOPEE_LOGISTICS_STATUS.LOGISTICS_READY,
  SHOPEE_LOGISTICS_STATUS.LOGISTICS_PENDING_ARRANGE,
  SHOPEE_LOGISTICS_STATUS.LOGISTICS_REQUEST_CANCELED,
  SHOPEE_LOGISTICS_STATUS.LOGISTICS_INVALID,
  SHOPEE_LOGISTICS_STATUS.LOGISTICS_COD_REJECTED,
  SHOPEE_LOGISTICS_STATUS.LOGISTICS_LOST,
]);

const NHANH_ECOMMERCE_CHANNELS = new Set<number>([
  NHANH_ORDER_SALE_CHANNEL.SHOPEE,
  NHANH_ORDER_SALE_CHANNEL.TIKTOK_SHOP,
  NHANH_ORDER_SALE_CHANNEL.LAZADA,
]);

function checkTiktokEligibility(
  order: PrintableOrderCandidate,
  allowReprint: boolean,
): PrintEligibilityResult {
  const status = Number(order.platformStatus);
  const isPrimaryPrintable =
    status === TIKTOK_ORDER_STATUS.AWAITING_COLLECTION ||
    status === TIKTOK_ORDER_STATUS.PARTIALLY_SHIPPING;
  const isReprint = allowReprint && status === TIKTOK_ORDER_STATUS.IN_TRANSIT;

  if (!isPrimaryPrintable && !isReprint) {
    return {
      printable: false,
      reason: 'TikTok order must be in AWAITING_COLLECTION or PARTIALLY_SHIPPING status',
    };
  }
  if (order.fulfillmentType !== undefined && order.fulfillmentType !== 0) {
    return {
      printable: false,
      reason: 'TikTok FBT / non-merchant fulfillment orders cannot print labels via API (21008043)',
    };
  }
  if (order.deliveryOptionType === 2) {
    return {
      printable: false,
      reason: 'TikTok seller self-shipping orders do not provide platform shipping labels',
    };
  }
  if (!order.packageId || !order.trackingNumber) {
    return {
      printable: false,
      reason: 'Missing TikTok packageId or trackingNumber',
    };
  }
  if (order.packageStatus === 'TO_FULFILL' || order.packageStatus === 'CANCELLED') {
    return {
      printable: false,
      reason: `TikTok package status ${order.packageStatus} is not printable`,
    };
  }

  return {
    printable: true,
    isReprint,
    recommendedStrategy: 'DIRECT_LINK',
  };
}

function checkShopeeEligibility(
  order: PrintableOrderCandidate,
  allowReprint: boolean,
): PrintEligibilityResult {
  const status = String(order.platformStatus);
  const isPrimaryPrintable =
    status === SHOPEE_ORDER_STATUS.PROCESSED ||
    status === SHOPEE_ORDER_STATUS.RETRY_SHIP;
  const isReprint = allowReprint && status === SHOPEE_ORDER_STATUS.SHIPPED;

  if (!isPrimaryPrintable && !isReprint) {
    return {
      printable: false,
      reason: 'Shopee order must be arranged shipment (PROCESSED) before printing',
    };
  }
  if (order.logisticsStatus && SHOPEE_BLOCKED_LOGISTICS_STATUSES.has(order.logisticsStatus)) {
    return {
      printable: false,
      reason: `Shopee logistics status ${order.logisticsStatus} does not support label printing`,
    };
  }
  if (!order.trackingNumber) {
    return {
      printable: false,
      reason: 'Missing Shopee trackingNumber',
    };
  }

  return {
    printable: true,
    isReprint,
    recommendedStrategy: 'SHOPEE_BATCH_WORKER',
  };
}

function checkNhanhEligibility(
  order: PrintableOrderCandidate,
  options: PrintEligibilityOptions,
): PrintEligibilityResult {
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

export interface TiktokPackageDedupResult<T> {
  uniqueItems: T[];
  skippedDuplicates: Array<{ item: T; sharedPackageId: string }>;
}

/**
 * Deduplicate TikTok combined orders that share the same packageId so the label is printed once.
 */
export function dedupeTiktokPackages<
  T extends { source: PrintSource; packageId?: string },
>(items: T[]): TiktokPackageDedupResult<T> {
  const seenPackageIds = new Set<string>();
  const uniqueItems: T[] = [];
  const skippedDuplicates: Array<{ item: T; sharedPackageId: string }> = [];

  for (const item of items) {
    if (item.source === 'TIKTOK' && item.packageId) {
      if (seenPackageIds.has(item.packageId)) {
        skippedDuplicates.push({ item, sharedPackageId: item.packageId });
        continue;
      }
      seenPackageIds.add(item.packageId);
    }
    uniqueItems.push(item);
  }

  return { uniqueItems, skippedDuplicates };
}

export interface ShopeeChunkGroup<T> {
  shopId: string;
  shippingDocumentType: SHOPEE_SHIPPING_DOCUMENT_TYPE | string;
  items: T[];
}

/**
 * Group Shopee orders by shopId + shippingDocumentType and split into chunks of max 50 items.
 */
export function chunkShopeePrintOrders<
  T extends { source: PrintSource; shopId: string; shippingDocumentType?: string },
>(items: T[], maxBatchSize = 50): ShopeeChunkGroup<T>[] {
  if (maxBatchSize < 1 || maxBatchSize > 50) {
    throw new Error('Shopee shipping document batch size must be between 1 and 50');
  }

  const grouped = new Map<string, { shopId: string; docType: string; items: T[] }>();

  for (const item of items) {
    if (item.source !== 'SHOPEE') continue;
    const docType = item.shippingDocumentType || SHOPEE_SHIPPING_DOCUMENT_TYPE.THERMAL_AIR_WAYBILL;
    const key = `${item.shopId}::${docType}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.items.push(item);
    } else {
      grouped.set(key, { shopId: item.shopId, docType, items: [item] });
    }
  }

  const chunks: ShopeeChunkGroup<T>[] = [];
  for (const group of grouped.values()) {
    for (let i = 0; i < group.items.length; i += maxBatchSize) {
      chunks.push({
        shopId: group.shopId,
        shippingDocumentType: group.docType,
        items: group.items.slice(i, i + maxBatchSize),
      });
    }
  }

  return chunks;
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

export interface ShopeeResultPartition<T> {
  stillProcessing: boolean;
  readyOrders: T[];
  failedOrders: Array<{ order: T; reason: string }>;
}

/**
 * Partition Shopee getShippingDocumentResult output to support Partial Success in batch jobs.
 * Explicitly matches Shopee statuses: READY, FAILED, PROCESSING, or unexpected status.
 */
export function partitionShopeeDocumentResult<
  T extends { order_sn: string; package_number?: string },
>(
  requestedOrders: T[],
  resultList: ShopeeShippingDocumentResultItem[],
): ShopeeResultPartition<T> {
  if (!resultList || resultList.length === 0) {
    return { stillProcessing: true, readyOrders: [], failedOrders: [] };
  }

  const stillProcessing = resultList.some(
    (item) => item.status === SHOPEE_STATUS_SHIPPING_DOCUMENT.PROCESSING,
  );
  if (stillProcessing) {
    return { stillProcessing: true, readyOrders: [], failedOrders: [] };
  }

  const readyOrders: T[] = [];
  const failedOrders: Array<{ order: T; reason: string }> = [];

  for (const order of requestedOrders) {
    const match = resultList.find(
      (r) =>
        r.order_sn === order.order_sn &&
        (!order.package_number || !r.package_number || r.package_number === order.package_number),
    );
    if (!match) {
      failedOrders.push({
        order,
        reason: 'Order not found in Shopee shipping document result list',
      });
    } else if (match.status === SHOPEE_STATUS_SHIPPING_DOCUMENT.READY) {
      readyOrders.push(order);
    } else if (match.status === SHOPEE_STATUS_SHIPPING_DOCUMENT.FAILED) {
      failedOrders.push({
        order,
        reason: match.fail_message || match.fail_error || 'Shopee shipping document failed',
      });
    } else {
      failedOrders.push({
        order,
        reason: `Shopee returned status: ${match.status}`,
      });
    }
  }

  return { stillProcessing: false, readyOrders, failedOrders };
}
