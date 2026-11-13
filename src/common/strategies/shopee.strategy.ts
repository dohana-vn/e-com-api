import { PlatformPrintStrategy } from './platform-strategy.interface';
import {
  PrintEligibilityOptions,
  PrintEligibilityResult,
  PrintableOrderCandidate,
  chunkShopeePrintOrders,
} from '../shipping-print.helper';
import {
  FetchShopeePrintOptions,
  ShopeeBatchPrintResult,
  ShopeePrintOrderInput,
  fetchShopeeBatchShippingDocuments,
} from '../shipping-print.client';
import {
  SHOPEE_LOGISTICS_STATUS,
  SHOPEE_ORDER_STATUS,
} from '../../module/shopee/common/constant';
import { ShopeeConfig } from '../../module/shopee/dto/request/config.request';

export interface ShopeePrintRequest {
  source: 'SHOPEE';
  orders: ShopeePrintOrderInput[];
  config: ShopeeConfig;
  options?: FetchShopeePrintOptions;
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

/**
 * Shopee printing strategy.
 * Encapsulates Shopee 4-step polling workflow, max-50 chunking, magic bytes detection, and uploadFile hook.
 */
export class ShopeePrintStrategy
  implements PlatformPrintStrategy<ShopeePrintRequest, ShopeeBatchPrintResult>
{
  public readonly source = 'SHOPEE' as const;

  /**
   * Check if Shopee order is ready to print.
   * Chặn bẫy READY_TO_SHIP: bắt buộc phải là PROCESSED (đã chuẩn bị hàng).
   */
  public isPrintable(
    order: PrintableOrderCandidate,
    options: PrintEligibilityOptions = {},
  ): PrintEligibilityResult {
    const allowReprint = Boolean(options.allowReprint);
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
    if (
      order.logisticsStatus &&
      SHOPEE_BLOCKED_LOGISTICS_STATUSES.has(order.logisticsStatus)
    ) {
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

  /**
   * Execute 4-step batch printing for Shopee orders (max 50 per batch).
   */
  public async print(
    request: ShopeePrintRequest,
  ): Promise<ShopeeBatchPrintResult> {
    return fetchShopeeBatchShippingDocuments(
      request.orders,
      request.config,
      request.options,
    );
  }

  /**
   * Helper utility to group and chunk orders by shopId and documentType (max 50/chunk).
   */
  public chunkOrders<
    T extends { source: 'SHOPEE' | string; shopId: string; shippingDocumentType?: string },
  >(items: T[], maxBatchSize = 50) {
    return chunkShopeePrintOrders(items as any, maxBatchSize);
  }
}
