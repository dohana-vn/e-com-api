import { ShopeeConfig } from '../dto/request/config.request';
import { SHOPEE_SHIPPING_DOCUMENT_TYPE } from '../common/constant';
import {
  createShippingDocument,
  downloadShippingDocument,
  getShippingDocumentResult,
} from './logistic.api';
import {
  detectDownloadedDocumentFormat,
  partitionShopeeDocumentResult,
} from '../common/shipping-print.helper';

export type ShopeeShippingFormat = 'PDF' | 'ZIP' | 'ZPL';

export interface ShopeeUploadFileHookOptions {
  filename: string;
  format: ShopeeShippingFormat;
  orderSns: string[];
  shopId?: string;
}

export type ShopeeUploadFileHook = (
  buffer: Uint8Array,
  meta: ShopeeUploadFileHookOptions,
) => Promise<string | { url: string }>;

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
  uploadFile?: ShopeeUploadFileHook;
}

export type ShopeeBatchPrintResult =
  | {
      source: 'SHOPEE';
      type: 'URL';
      url: string;
      format: ShopeeShippingFormat;
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
      format: ShopeeShippingFormat;
      readyOrders: ShopeePrintOrderInput[];
      failedOrders: Array<{ order: ShopeePrintOrderInput; reason: string }>;
    }
  | {
      source: 'SHOPEE';
      type: 'NO_DOCUMENT';
      readyOrders: ShopeePrintOrderInput[];
      failedOrders: Array<{ order: ShopeePrintOrderInput; reason: string }>;
      reason: string;
    };

function isShopeeNonRetryableError(error: any): boolean {
  const msg = String(error?.message || error?.msg || error || '').toLowerCase();
  const errorKey = String(error?.error || '').toLowerCase();
  return (
    errorKey.includes('invalid_token') ||
    errorKey.includes('token_expired') ||
    errorKey.includes('error_auth') ||
    msg.includes('token expired') ||
    msg.includes('invalid access_token') ||
    msg.includes('partner is invalid') ||
    msg.includes('invalid sign')
  );
}

/**
 * High-level production workflow to create, poll, download, and optionally upload
 * Shopee batch shipping documents.
 */
export async function fetchShopeeBatchShippingDocuments(
  orders: ShopeePrintOrderInput[],
  config: ShopeeConfig,
  options: FetchShopeePrintOptions = {},
): Promise<ShopeeBatchPrintResult> {
  if (!orders || orders.length === 0) {
    throw new Error('Shopee batch print requires at least 1 order');
  }
  if (orders.length > 50) {
    throw new Error(
      `Shopee batch print limit exceeded: requested ${orders.length} orders, maximum allowed is 50. Use chunkShopeePrintOrders to split batches.`,
    );
  }

  const shippingDocumentType =
    (options.shippingDocumentType as SHOPEE_SHIPPING_DOCUMENT_TYPE) ||
    SHOPEE_SHIPPING_DOCUMENT_TYPE.THERMAL_AIR_WAYBILL;
  const maxAttempts = options.maxPollAttempts ?? 15;
  const pollIntervalMs = options.pollIntervalMs ?? 1500;

  // Step 1: Request document creation
  await createShippingDocument(
    {
      order_list: orders.map((o) => ({
        order_sn: o.order_sn,
        ...(o.package_number ? { package_number: o.package_number } : {}),
        ...(o.tracking_number ? { tracking_number: o.tracking_number } : {}),
        shipping_document_type: shippingDocumentType,
      })),
    },
    config,
  );

  // Step 2: Poll get_shipping_document_result
  let lastPartition: ReturnType<typeof partitionShopeeDocumentResult<ShopeePrintOrderInput>> = {
    stillProcessing: true,
    readyOrders: [],
    failedOrders: [],
  };
  let completed = false;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let resultRes: any;
    try {
      resultRes = await getShippingDocumentResult(
        {
          order_list: orders.map((o) => ({
            order_sn: o.order_sn,
            ...(o.package_number ? { package_number: o.package_number } : {}),
          })),
          shipping_document_type: shippingDocumentType,
        },
        config,
      );
    } catch (err: any) {
      if (isShopeeNonRetryableError(err)) {
        throw new Error(`Shopee shipping document polling aborted due to fatal auth/parameter error: ${err.message || err}`);
      }
      if (attempt === maxAttempts) {
        throw err;
      }
    }

    const resultList = resultRes?.response?.result_list || resultRes?.result_list || [];
    lastPartition = partitionShopeeDocumentResult(orders, resultList);

    if (!lastPartition.stillProcessing) {
      completed = true;
      break;
    }

    if (attempt < maxAttempts) {
      if (options.onPollWait) {
        await options.onPollWait(pollIntervalMs, attempt);
      } else {
        await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
      }
    }
  }

  const { readyOrders, failedOrders } = lastPartition;

  if (!completed) {
    throw new Error(
      `Shopee shipping document polling timed out after ${maxAttempts} attempts (${maxAttempts * pollIntervalMs}ms). ` +
        `Ready: ${readyOrders.length}, Failed: ${failedOrders.length}, Still processing: ${orders.length - readyOrders.length - failedOrders.length}.`,
    );
  }

  if (readyOrders.length === 0) {
    return {
      source: 'SHOPEE',
      type: 'NO_DOCUMENT',
      readyOrders: [],
      failedOrders,
      reason:
        failedOrders.length > 0
          ? `All ${failedOrders.length} requested order(s) failed document generation: ${failedOrders.map((f) => `${f.order.order_sn}: ${f.reason}`).join('; ')}`
          : 'Shopee returned no ready documents for the requested orders',
    };
  }

  // Step 3: Download document
  const downloaded = await downloadShippingDocument(
    {
      order_list: readyOrders.map((o) => ({
        order_sn: o.order_sn,
        ...(o.package_number ? { package_number: o.package_number } : {}),
      })),
      shipping_document_type: shippingDocumentType,
    },
    config,
  );

  const rawBytes: Uint8Array =
    downloaded?.buffer instanceof Uint8Array
      ? downloaded.buffer
      : downloaded instanceof Uint8Array
      ? downloaded
      : Buffer.isBuffer(downloaded)
      ? new Uint8Array(downloaded)
      : new Uint8Array();

  const detected = detectDownloadedDocumentFormat(rawBytes);
  const format: ShopeeShippingFormat =
    detected === 'ZIP' ? 'ZIP' : detected === 'ZPL' ? 'ZPL' : 'PDF';
  const ext = format.toLowerCase();
  const defaultFilename =
    readyOrders.length === 1
      ? `shopee_${readyOrders[0].order_sn}.${ext}`
      : `shopee_batch_${readyOrders.length}_${Date.now()}.${ext}`;
  const filename = downloaded?.filename || defaultFilename;

  // Step 4: Optional upload hook
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

export const getBatchShippingDocuments = fetchShopeeBatchShippingDocuments;
