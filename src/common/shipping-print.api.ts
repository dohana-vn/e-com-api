import {
  TiktokConfig,
} from '../module/tiktokshops/dto/request/config.request';
import {
  ShopeeConfig,
} from '../module/shopee/dto/request/config.request';
import {
  TIKTOK_DOCUMENT_TYPE,
  TIKTOK_ORDER_STATUS,
} from '../module/tiktokshops/common/constant';
import {
  TiktokShippingDocumentOptions,
} from '../module/tiktokshops/dto/response/fulfillment.response';
import {
  SHOPEE_SHIPPING_DOCUMENT_TYPE,
  SHOPEE_STATUS_SHIPPING_DOCUMENT,
} from '../module/shopee/common/constant';
import {
  ShopeeDownloadedFile,
} from '../module/shopee/dto/response/logistic.reponse';
import * as TiktokFulfillmentApi from '../module/tiktokshops/api/v2/fulfillment.api';
import * as ShopeeLogisticApi from '../module/shopee/api/logistic.api';
import {
  DownloadedDocumentFormat,
  detectDownloadedDocumentFormat,
  partitionShopeeDocumentResult,
  PrintSource,
} from './shipping-print.helper';

export type ShippingFormat = 'PDF' | 'ZIP' | 'ZPL';

export interface UploadFileHookOptions {
  filename: string;
  format: ShippingFormat;
  orderSns: string[];
  shopId?: string;
}

export type UploadFileHook = (
  buffer: Uint8Array,
  meta: UploadFileHookOptions,
) => Promise<string | { url: string }>;

export interface FetchTiktokPrintOptions extends TiktokShippingDocumentOptions {
  documentType?: TIKTOK_DOCUMENT_TYPE;
}

export interface TiktokPrintResult {
  type: 'URL';
  source: 'TIKTOK';
  url: string;
  trackingNumber?: string;
  packageId: string;
  format: 'PDF' | 'PNG' | 'ZPL';
}

/**
 * Fetch shipping document URL for a TikTok Shop package.
 */
export async function fetchTiktokShippingDocumentUrl(
  packageId: string,
  config: TiktokConfig,
  options: FetchTiktokPrintOptions = {},
): Promise<TiktokPrintResult> {
  if (!packageId) {
    throw new Error('packageId is required to fetch TikTok shipping document');
  }

  const docType = options.documentType || TIKTOK_DOCUMENT_TYPE.SHIPPING_LABEL;
  const res = await TiktokFulfillmentApi.getPackageShippingDocument(
    packageId,
    docType,
    config,
    options,
  );

  const docUrl = res?.data?.doc_url;
  if (!docUrl) {
    const errorMsg = res?.message || 'TikTok did not return a doc_url for this package';
    throw new Error(`Failed to get TikTok shipping document: ${errorMsg}`);
  }

  const format: 'PDF' | 'PNG' | 'ZPL' =
    options.document_format === 'ZPL'
      ? 'ZPL'
      : docType === TIKTOK_DOCUMENT_TYPE.SHIPPING_LABEL_PICTURE
      ? 'PNG'
      : 'PDF';

  return {
    type: 'URL',
    source: 'TIKTOK',
    url: docUrl,
    trackingNumber: res.data.tracking_number,
    packageId,
    format,
  };
}

export interface ShopeePrintOrderInput {
  order_sn: string;
  package_number?: string;
  tracking_number?: string;
}

export interface FetchShopeePrintOptions {
  shippingDocumentType?: SHOPEE_SHIPPING_DOCUMENT_TYPE | string;
  maxPollAttempts?: number;
  pollIntervalMs?: number;
  onPollWait?: (ms: number, attempt: number) => Promise<void> | void;
  uploadFile?: UploadFileHook;
}

/**
 * 5. Discriminated Union for Shopee batch print result
 */
export type ShopeeBatchPrintResult =
  | {
      source: 'SHOPEE';
      type: 'URL';
      url: string;
      format: ShippingFormat;
      readyOrders: ShopeePrintOrderInput[];
      failedOrders: Array<{ order: ShopeePrintOrderInput; reason: string }>;
    }
  | {
      source: 'SHOPEE';
      type: 'BUFFER';
      file: {
        filename: string;
        buffer: Uint8Array;
      };
      format: ShippingFormat;
      readyOrders: ShopeePrintOrderInput[];
      failedOrders: Array<{ order: ShopeePrintOrderInput; reason: string }>;
    }
  | {
      source: 'SHOPEE';
      type: 'NO_DOCUMENT';
      readyOrders: ShopeePrintOrderInput[];
      failedOrders: Array<{ order: ShopeePrintOrderInput; reason: string }>;
    };

const defaultSleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Check whether a Shopee error response is non-retryable (auth error, invalid param, etc.)
 */
function isNonRetryableError(resOrError: any): boolean {
  if (!resOrError) return false;
  const msg = String(resOrError.message || resOrError.error || resOrError).toLowerCase();
  return (
    msg.includes('auth') ||
    msg.includes('token') ||
    msg.includes('permission') ||
    msg.includes('param') ||
    msg.includes('forbidden') ||
    msg.includes('invalid')
  );
}

/**
 * Execute the 4-step Shopee shipping document workflow (create -> poll -> download -> optional upload hook).
 * Supports up to 50 orders in one batch.
 */
export async function fetchShopeeBatchShippingDocuments(
  orders: ShopeePrintOrderInput[],
  config: ShopeeConfig,
  options: FetchShopeePrintOptions = {},
): Promise<ShopeeBatchPrintResult> {
  if (!orders || orders.length === 0) {
    throw new Error('At least one order is required to fetch Shopee shipping documents');
  }
  if (orders.length > 50) {
    throw new Error('Shopee shipping documents batch size exceeds maximum limit of 50 orders');
  }

  const docType =
    options.shippingDocumentType || SHOPEE_SHIPPING_DOCUMENT_TYPE.THERMAL_AIR_WAYBILL;
  const maxAttempts = options.maxPollAttempts ?? 10;
  const pollInterval = options.pollIntervalMs ?? 1500;
  const waitFn = options.onPollWait || defaultSleep;

  // Step 1: Create background shipping document task
  const createRes = await ShopeeLogisticApi.createShippingDocument(
    {
      order_list: orders.map((o) => ({
        order_sn: o.order_sn,
        package_number: o.package_number,
        tracking_number: o.tracking_number,
        shipping_document_type: docType,
      })),
    },
    config,
  );

  if (createRes?.error && !createRes?.response?.result_list?.length) {
    throw new Error(`Shopee create_shipping_document failed: ${createRes.message || createRes.error}`);
  }

  // Step 2: Poll getShippingDocumentResult until completed or timeout
  let readyOrders: ShopeePrintOrderInput[] = [];
  let failedOrders: Array<{ order: ShopeePrintOrderInput; reason: string }> = [];
  let completed = false;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await waitFn(pollInterval, attempt);

    let queryRes: any;
    try {
      queryRes = await ShopeeLogisticApi.getShippingDocumentResult(
        {
          order_list: orders.map((o) => ({
            order_sn: o.order_sn,
            package_number: o.package_number,
          })),
          shipping_document_type: docType,
        },
        config,
      );
    } catch (err: any) {
      // 3. Phân biệt lỗi có thể retry với lỗi không thể retry
      if (isNonRetryableError(err) || attempt === maxAttempts) {
        throw err;
      }
      continue;
    }

    if (isNonRetryableError(queryRes)) {
      throw new Error(
        `Shopee get_shipping_document_result fatal error: ${queryRes.message || queryRes.error}`,
      );
    }

    const resultList = queryRes?.response?.result_list || [];
    // 4. Phân biệt trạng thái đối chiếu thực tế từ API Shopee
    const partition = partitionShopeeDocumentResult(orders, resultList);

    if (!partition.stillProcessing) {
      readyOrders = partition.readyOrders;
      failedOrders = partition.failedOrders;
      completed = true;
      break;
    }
  }

  // 1. Xử lý khi Polling hết số lần thử
  if (!completed) {
    throw new Error('Shopee document processing timeout');
  }

  // 2. Không download khi không có đơn READY
  if (readyOrders.length === 0) {
    return {
      source: 'SHOPEE',
      type: 'NO_DOCUMENT',
      readyOrders,
      failedOrders,
    };
  }

  // Step 3: Download document binary
  const downloaded: ShopeeDownloadedFile = await ShopeeLogisticApi.downloadShippingDocument(
    {
      order_list: readyOrders.map((o) => ({
        order_sn: o.order_sn,
        package_number: o.package_number,
      })),
      shipping_document_type: docType,
    },
    config,
  );

  const rawBytes = downloaded?.buffer || new Uint8Array();
  const rawFormat = detectDownloadedDocumentFormat(rawBytes);
  const format: ShippingFormat = rawFormat === 'ZIP' ? 'ZIP' : rawFormat === 'ZPL' ? 'ZPL' : 'PDF';
  const ext = format === 'ZIP' ? 'zip' : format === 'ZPL' ? 'zpl' : 'pdf';
  const defaultFilename =
    readyOrders.length === 1
      ? `shopee_${readyOrders[0].order_sn}.${ext}`
      : `shopee_batch_${readyOrders.length}_${Date.now()}.${ext}`;
  const filename = downloaded?.filename || defaultFilename;

  // Step 4: Optional upload hook to transform buffer into S3 / CDN URL
  if (options.uploadFile && rawBytes.length > 0) {
    const uploadRes = await options.uploadFile(rawBytes, {
      filename,
      format,
      orderSns: readyOrders.map((o) => o.order_sn),
      shopId: config.shopId,
    });
    const url = typeof uploadRes === 'string' ? uploadRes : uploadRes?.url;
    return {
      source: 'SHOPEE',
      type: 'URL',
      url,
      format,
      readyOrders,
      failedOrders,
    };
  }

  return {
    source: 'SHOPEE',
    type: 'BUFFER',
    file: {
      filename,
      buffer: rawBytes,
    },
    format,
    readyOrders,
    failedOrders,
  };
}

export type UnifiedPrintRequest =
  | {
      source: 'TIKTOK';
      packageId: string;
      config: TiktokConfig;
      options?: FetchTiktokPrintOptions;
    }
  | {
      source: 'SHOPEE';
      orders: ShopeePrintOrderInput[];
      config: ShopeeConfig;
      options?: FetchShopeePrintOptions;
    }
  | {
      source: 'NHANH';
      orderData?: any;
      message?: string;
    };

/**
 * 5. Discriminated Union for Unified Print Result
 */
export type UnifiedPrintResult =
  | TiktokPrintResult
  | ShopeeBatchPrintResult
  | {
      source: 'NHANH';
      type: 'RAW_DATA';
      orderData?: any;
      message: string;
    };

/**
 * Unified entrypoint to fetch print documents across TikTok Shop, Shopee, and Nhanh.vn.
 * Clean, direct switch-case implementation matching existing codebase conventions.
 */
export async function getShippingPrintDocument(
  request: UnifiedPrintRequest,
): Promise<UnifiedPrintResult> {
  switch (request.source) {
    case 'TIKTOK':
      return fetchTiktokShippingDocumentUrl(
        request.packageId,
        request.config,
        request.options,
      );
    case 'SHOPEE':
      return fetchShopeeBatchShippingDocuments(
        request.orders,
        request.config,
        request.options,
      );
    case 'NHANH':
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
