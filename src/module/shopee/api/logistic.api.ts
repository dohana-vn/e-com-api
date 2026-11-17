import * as ShopeeHelper from '../common/helper';
import { SHOPEE_END_POINT, SHOPEE_PATH } from '../common/constant';
import { ShopeeConfig } from '../dto/request/config.request';
import {
  ShopeeDownloadedFile,
  ShopeeResponseCreateShippingDocument,
  ShopeeResponseGetShippingDocumentParameter,
  ShopeeResponseGetShippingDocumentResult,
  ShopeeResponseLogisticChannelList,
  ShopeeResponseShipOrder,
  ShopeeResponseShippingParameter,
} from '../dto/response/logistic.reponse';
import {
  ShopeeRequestCreateShippingDocument,
  ShopeeRequestDownloadShippingDocument,
  ShopeeRequestGetShippingDocumentParameter,
  ShopeeRequestGetShippingDocumentResult,
  ShopeeRequestShipOrder,
} from '../dto/request/logistic.request';

/**
 *
 * @param region - Region.
 * @param config - Shopee API configuration.
 * @returns {Promise<ShopeeResponseLogisticChannelList>}
 */
export async function getChannelList(
  config: ShopeeConfig,
  region?: string,
): Promise<ShopeeResponseLogisticChannelList> {
  const timestamp = ShopeeHelper.getTimestampNow();
  const signature = ShopeeHelper.signRequest(SHOPEE_PATH.CHANNEL_LIST, config, timestamp);

  const additionalParams = region ? { region } : {};
  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
    additionalParams,
  );

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.CHANNEL_LIST}${commonParam}`;
  return ShopeeHelper.httpGet(url, config);
}

/**
 *
 * @param orderNumber - Order number.
 * @param config - Shopee API configuration.
 * @returns {Promise<ShopeeResponseGetCategories>}
 */
export async function shippingParameter(orderNumber: string, config: ShopeeConfig): Promise<ShopeeResponseShippingParameter> {
  const timestamp = ShopeeHelper.getTimestampNow();
  const signature = ShopeeHelper.signRequest(SHOPEE_PATH.SHIPPING_PARAMS, config, timestamp);

  const additionalParams = {
    order_sn: orderNumber,
  };
  const commonParam = ShopeeHelper.buildCommonParams(config, signature, timestamp, additionalParams);
  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.SHIPPING_PARAMS}${commonParam}`;

  return ShopeeHelper.httpGet(url, config);
}

/**
 *
 * @param orderNumber - Order number.
 * @param config - Shopee API configuration.
 * @returns {Promise<ShopeeResponseShipOrder>}
 */
export async function shipOrder(
  orderNumber: string,
  addressId: number,
  timeSlot: string,
  config: ShopeeConfig,
): Promise<ShopeeResponseShipOrder> {
  const timestamp = ShopeeHelper.getTimestampNow();
  const signature = ShopeeHelper.signRequest(SHOPEE_PATH.SHIP_ORDER, config, timestamp);

  const commonParam = ShopeeHelper.buildCommonParams(config, signature, timestamp);

  const body: ShopeeRequestShipOrder = {
    order_sn: orderNumber,
    pickup: {
      address_id: addressId,
      pickup_time_id: timeSlot,
    },
  };

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.SHIP_ORDER}${commonParam}`;

  return ShopeeHelper.httpPost(url, body, config);
}

/**
 *
 * @param bookingSn - Booking serial number.
 * @param config - Shopee API configuration.
 * @returns {Promise<any>}
 */
export async function getBookingTrackingNumber(
  bookingSn: string,
  config: ShopeeConfig,
): Promise<any> {
  const timestamp = ShopeeHelper.getTimestampNow();
  const signature = ShopeeHelper.signRequest(
    SHOPEE_PATH.GET_BOOKING_TRACKING_NUMBER,
    config,
    timestamp,
  );

  const additionalParams = {
    booking_sn: bookingSn,
  };

  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
    additionalParams,
  );

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.GET_BOOKING_TRACKING_NUMBER}${commonParam}`;

  return ShopeeHelper.httpGet(url, config);
}

/**
 *
 * @param orderNumber - Order serial number.
 * @param config - Shopee API configuration.
 * @returns {Promise<ShopeeResponseTrackingNumber>}
 */
export async function getTrackingNumber(
  orderNumber: string,
  config: ShopeeConfig,
): Promise<any> {
  const timestamp = ShopeeHelper.getTimestampNow();
  const signature = ShopeeHelper.signRequest(
    SHOPEE_PATH.GET_TRACKING_NUMBER,
    config,
    timestamp,
  );

  const additionalParams = {
    order_sn: orderNumber.trim(),
    response_optional_fields: 'first_mile_tracking_number',
  };

  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
    additionalParams,
  );

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.GET_TRACKING_NUMBER}${commonParam}`;

  return ShopeeHelper.httpGet(url, config);
}

/**
 *
 * @param packageNumbers - List package_number (max 50)
 * @param config - Shopee API configuration.
 * @returns {Promise<any>}
 */
export async function getMassTrackingNumber(
  packageNumbers: string[],
  config: ShopeeConfig,
): Promise<any> {
  const timestamp = ShopeeHelper.getTimestampNow();

  const signature = ShopeeHelper.signRequest(
    SHOPEE_PATH.GET_MASS_TRACKING_NUMBER,
    config,
    timestamp,
  );

  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
  );

  const body = {
    package_list: packageNumbers.map((pkg) => ({
      package_number: pkg,
    })),
    response_optional_fields: 'first_mile_tracking_number',
  };

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.GET_MASS_TRACKING_NUMBER}${commonParam}`;

  return ShopeeHelper.httpPost(url, body, config);
}

/**
 * Query selectable & suggested shipping document types for up to 50 orders.
 * @param payload - Orders to inspect shipping document parameters.
 * @param config - Shopee API configuration.
 */
export async function getShippingDocumentParameter(
  payload: ShopeeRequestGetShippingDocumentParameter,
  config: ShopeeConfig,
): Promise<ShopeeResponseGetShippingDocumentParameter> {
  const timestamp = ShopeeHelper.getTimestampNow();
  const signature = ShopeeHelper.signRequest(
    SHOPEE_PATH.GET_SHIPPING_DOCUMENT_PARAMETER,
    config,
    timestamp,
  );

  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
  );

  const body: ShopeeRequestGetShippingDocumentParameter = {
    order_list: payload.order_list.map((order) => ({
      order_sn: order.order_sn,
      ...(order.package_number ? { package_number: order.package_number } : {}),
    })),
  };

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.GET_SHIPPING_DOCUMENT_PARAMETER}${commonParam}`;

  return ShopeeHelper.httpPost(url, body, config);
}

/**
 *
 * @param payload - Shipping document task payload.
 * @param config - Shopee API configuration.
 * @returns {Promise<ShopeeResponseCreateShippingDocument>}
 */
export async function createShippingDocument(
  payload: ShopeeRequestCreateShippingDocument,
  config: ShopeeConfig,
): Promise<ShopeeResponseCreateShippingDocument | any> {
  const timestamp = ShopeeHelper.getTimestampNow();
  const signature = ShopeeHelper.signRequest(
    SHOPEE_PATH.CREATE_SHIPPING_DOCUMENTS,
    config,
    timestamp,
  );

  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
  );

  const body: ShopeeRequestCreateShippingDocument = {
    order_list: payload.order_list.map((order) => ({
      order_sn: order.order_sn,
      ...(order.package_number ? { package_number: order.package_number } : {}),
      ...(order.tracking_number ? { tracking_number: order.tracking_number } : {}),
      ...(order.shipping_document_type
        ? { shipping_document_type: order.shipping_document_type }
        : {}),
    })),
  };

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.CREATE_SHIPPING_DOCUMENTS}${commonParam}`;

  return ShopeeHelper.httpPost(url, body, config);
}

/**
 *
 * @param payload - Shipping document task query payload.
 * @param config - Shopee API configuration.
 * @returns {Promise<ShopeeResponseGetShippingDocumentResult>}
 */
export async function getShippingDocumentResult(
  payload: ShopeeRequestGetShippingDocumentResult,
  config: ShopeeConfig,
): Promise<ShopeeResponseGetShippingDocumentResult | any> {
  const timestamp = ShopeeHelper.getTimestampNow();
  const signature = ShopeeHelper.signRequest(
    SHOPEE_PATH.GET_SHIPPING_DOCUMENTS,
    config,
    timestamp,
  );

  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
  );

  const body: ShopeeRequestGetShippingDocumentResult = {
    order_list: payload.order_list.map((order) => ({
      order_sn: order.order_sn,
      ...(order.package_number ? { package_number: order.package_number } : {}),
    })),
    ...(payload.shipping_document_type
      ? { shipping_document_type: payload.shipping_document_type }
      : {}),
  };

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.GET_SHIPPING_DOCUMENTS}${commonParam}`;

  return ShopeeHelper.httpPost(url, body, config);
}

/**
 *
 * @param payload - Shipping document payload.
 * @param config - Shopee API configuration.
 * @returns {Promise<ShopeeDownloadedFile | any>}
 */
export async function downloadShippingDocument(
  payload: ShopeeRequestDownloadShippingDocument,
  config: ShopeeConfig,
): Promise<ShopeeDownloadedFile | any> {
  const timestamp = ShopeeHelper.getTimestampNow();
  const signature = ShopeeHelper.signRequest(
    SHOPEE_PATH.DOWNLOAD_SHIPPING_DOCUMENT,
    config,
    timestamp,
  );

  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
  );

  const body: ShopeeRequestDownloadShippingDocument = {
    order_list: payload.order_list.map((order) => ({
      order_sn: order.order_sn,
      ...(order.package_number ? { package_number: order.package_number } : {}),
    })),
    ...(payload.shipping_document_type
      ? { shipping_document_type: payload.shipping_document_type }
      : {}),
  };

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.DOWNLOAD_SHIPPING_DOCUMENT}${commonParam}`;

  return ShopeeHelper.httpPostDownload(url, body, config);
}

import {
  detectDownloadedDocumentFormat,
  partitionShopeeDocumentResult,
} from '../common/shipping-print.helper';
import { SHOPEE_SHIPPING_DOCUMENT_TYPE } from '../common/constant';

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
