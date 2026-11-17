import { TIKTOK_ORDER_STATUS } from './constant';
import { TiktokPackageStatus } from '../dto/response/fulfillment.response';

export interface TiktokPrintEligibilityCandidate {
  platformStatus: string | number;
  trackingNumber?: string;
  packageId?: string;
  packageStatus?: TiktokPackageStatus | string;
  fulfillmentType?: number;
  deliveryOptionType?: number;
}

export interface TiktokPrintEligibilityResult {
  printable: boolean;
  isReprint?: boolean;
  recommendedStrategy?: 'DIRECT_LINK';
  reason?: string;
}

/**
 * Validate whether a TikTok Shop package/order is ready for label printing.
 */
export function checkTiktokEligibility(
  order: TiktokPrintEligibilityCandidate,
  allowReprint: boolean = false,
): TiktokPrintEligibilityResult {
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

export interface TiktokPackageDedupResult<T> {
  uniqueItems: T[];
  skippedDuplicates: Array<{ item: T; sharedPackageId: string }>;
}

/**
 * Deduplicate TikTok combined orders that share the same packageId so the label is printed once.
 */
export function dedupeTiktokPackages<
  T extends { source?: string; packageId?: string },
>(items: T[]): TiktokPackageDedupResult<T> {
  const seenPackageIds = new Set<string>();
  const uniqueItems: T[] = [];
  const skippedDuplicates: Array<{ item: T; sharedPackageId: string }> = [];

  for (const item of items) {
    if ((!item.source || item.source === 'TIKTOK') && item.packageId) {
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
