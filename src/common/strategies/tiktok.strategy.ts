import { PlatformPrintStrategy } from './platform-strategy.interface';
import {
  PrintEligibilityOptions,
  PrintEligibilityResult,
  PrintableOrderCandidate,
  dedupeTiktokPackages,
} from '../shipping-print.helper';
import {
  FetchTiktokPrintOptions,
  TiktokPrintResult,
  fetchTiktokShippingDocumentUrl,
} from '../shipping-print.client';
import { TIKTOK_ORDER_STATUS } from '../../module/tiktokshops/common/constant';
import { TiktokConfig } from '../../module/tiktokshops/dto/request/config.request';

export interface TiktokPrintRequest {
  source: 'TIKTOK';
  packageId: string;
  config: TiktokConfig;
  options?: FetchTiktokPrintOptions;
}

/**
 * TikTok Shop printing strategy.
 * Encapsulates TikTok-specific validation, package deduplication, and CDN label retrieval.
 */
export class TiktokPrintStrategy
  implements PlatformPrintStrategy<TiktokPrintRequest, TiktokPrintResult>
{
  public readonly source = 'TIKTOK' as const;

  /**
   * Check if TikTok order is ready to print.
   * Chặn đơn FBT (21008043) và đơn tự vận chuyển.
   */
  public isPrintable(
    order: PrintableOrderCandidate,
    options: PrintEligibilityOptions = {},
  ): PrintEligibilityResult {
    const allowReprint = Boolean(options.allowReprint);
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
    if (!order.trackingNumber && !order.packageId) {
      return {
        printable: false,
        reason: 'Missing TikTok trackingNumber or packageId',
      };
    }

    return {
      printable: true,
      isReprint,
      recommendedStrategy: 'DIRECT_LINK',
    };
  }

  /**
   * Execute label URL fetching from TikTok Shop Open API.
   */
  public async print(request: TiktokPrintRequest): Promise<TiktokPrintResult> {
    return fetchTiktokShippingDocumentUrl(
      request.packageId,
      request.config,
      request.options,
    );
  }

  /**
   * Helper utility to deduplicate combined packages.
   */
  public dedupePackages<T extends { source: 'TIKTOK' | string; packageId?: string }>(
    items: T[],
  ) {
    return dedupeTiktokPackages(items as any);
  }
}
