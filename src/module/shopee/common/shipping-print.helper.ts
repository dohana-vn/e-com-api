import {
  SHOPEE_LOGISTICS_STATUS,
  SHOPEE_ORDER_STATUS,
  SHOPEE_SHIPPING_DOCUMENT_TYPE,
  SHOPEE_STATUS_SHIPPING_DOCUMENT,
} from './constant';
import { ShopeeShippingDocumentResultItem } from '../dto/response/logistic.reponse';

export const SHOPEE_BLOCKED_LOGISTICS_STATUSES = new Set<string>([
  SHOPEE_LOGISTICS_STATUS.LOGISTICS_NOT_STARTED,
  SHOPEE_LOGISTICS_STATUS.LOGISTICS_READY,
  SHOPEE_LOGISTICS_STATUS.LOGISTICS_PENDING_ARRANGE,
  SHOPEE_LOGISTICS_STATUS.LOGISTICS_REQUEST_CANCELED,
  SHOPEE_LOGISTICS_STATUS.LOGISTICS_INVALID,
  SHOPEE_LOGISTICS_STATUS.LOGISTICS_COD_REJECTED,
  SHOPEE_LOGISTICS_STATUS.LOGISTICS_LOST,
]);

export interface ShopeePrintEligibilityCandidate {
  platformStatus: string | number;
  trackingNumber?: string;
  logisticsStatus?: SHOPEE_LOGISTICS_STATUS | string;
  packageNumber?: string;
}

export interface ShopeePrintEligibilityResult {
  printable: boolean;
  isReprint?: boolean;
  recommendedStrategy?: 'SHOPEE_BATCH_WORKER';
  reason?: string;
}

/**
 * Validate whether a Shopee order is ready for label printing.
 */
export function checkShopeeEligibility(
  order: ShopeePrintEligibilityCandidate,
  allowReprint: boolean = false,
): ShopeePrintEligibilityResult {
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

export const isShopeeOrderPrintable = checkShopeeEligibility;

export interface ShopeeChunkGroup<T> {
  shopId: string;
  shippingDocumentType: SHOPEE_SHIPPING_DOCUMENT_TYPE | string;
  items: T[];
}

/**
 * Group Shopee orders by shopId + shippingDocumentType and split into chunks of max 50 items.
 */
export function chunkShopeePrintOrders<
  T extends { source?: string; shopId: string; shippingDocumentType?: string },
>(items: T[], maxBatchSize = 50): ShopeeChunkGroup<T>[] {
  if (maxBatchSize < 1 || maxBatchSize > 50) {
    throw new Error('Shopee shipping document batch size must be between 1 and 50');
  }

  const grouped = new Map<string, { shopId: string; docType: string; items: T[] }>();

  for (const item of items) {
    if (item.source && item.source !== 'SHOPEE') continue;
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
