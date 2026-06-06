import { ShopeeConfig } from '../dto/request/config.request';
import axios, { AxiosResponse } from 'axios';
import { createHmac } from 'crypto';
import { readFile } from 'fs/promises';
import { basename, extname } from 'path';

const SUPPORTED_IMAGE_MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

const MAX_IMAGE_UPLOAD_SIZE = 10 * 1024 * 1024;

function commonParameter(config: ShopeeConfig, signature: string, timestamp: number) {
  const { partnerId, accessToken, shopId } = config;
  const commonParam = `?shop_id=${shopId}&partner_id=${partnerId}&access_token=${accessToken}&sign=${signature}&timestamp=${timestamp}`;
  return commonParam;
}

// function signRequest(path: string, config: ShopeeConfig, timestamp) {
//   const { partnerId, accessToken, shopId, partnerKey } = config;
//   let params = [partnerId, path, timestamp.toString(), accessToken, shopId];
//   params = params.filter(function (item) {
//     return item !== null;
//   });
//   const baseString = params.reduce((prev, curr) => (prev += curr), '');

//   return createHmac('sha256', partnerKey).update(baseString).digest('hex');
// }

function signRequestUrl(path: string, config: ShopeeConfig, timestamp: number) {
  const { partnerId, partnerKey } = config;

  const baseString = `${partnerId}${path}${timestamp}`;

  return createHmac("sha256", partnerKey)
    .update(baseString)
    .digest("hex");
}

function signRequest(path: string, config: ShopeeConfig, timestamp: number) {
  const { partnerId, partnerKey, accessToken, shopId } = config;

  const baseString = `${partnerId}${path}${timestamp}${accessToken}${shopId}`;

  return createHmac("sha256", partnerKey)
    .update(baseString)
    .digest("hex");
}

function getTimestampNow() {
  return Math.floor(Date.now() / 1000);
}

function getTimestampMinutesAgo(minutes) {
  const oldDate = new Date();
  oldDate.setMilliseconds(0);
  return Math.floor((oldDate.getTime() - minutes * 60 * 1000) / 1000);
}

function buildCommonParameters(config, signature, timestamp, timeFrom, cursor) {
  return `${commonParameter(
    config,
    signature,
    timestamp,
  )}&time_range_field=create_time&time_from=${timeFrom}&time_to=${timestamp}&page_size=50&cursor=${cursor}`;
}

function buildCommonParametersWithTimeRange(
  config,
  signature,
  timestamp,
  timeFrom,
  cursor,
  timeTo,
) {
  return `${commonParameter(
    config,
    signature,
    timestamp,
  )}&time_range_field=create_time&time_from=${timeFrom}&time_to=${timeTo}&page_size=50&cursor=${cursor}`;
}

function buildCommonParams(config: any, signature: string, timestamp: number, additionalParams?: Record<string, any>): string {
  const { partnerId, accessToken, shopId } = config;
  let paramString = `?shop_id=${shopId}&partner_id=${partnerId}&access_token=${accessToken}&sign=${signature}&timestamp=${timestamp}`;

  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      paramString += `&${key}=${encodeURIComponent(value)}`;
    });
  }
  return paramString;
}

function optionalField() {
  return [
    'buyer_user_id',
    'buyer_username',
    'estimated_shipping_fee',
    'recipient_address',
    'actual_shipping_fee',
    'goods_to_declare',
    'note',
    'note_update_time',
    'item_list',
    'pay_time',
    'dropshipper',
    'dropshipper_phone',
    'split_up',
    'buyer_cancel_reason',
    'cancel_by',
    'cancel_reason',
    'actual_shipping_fee_confirmed',
    'buyer_cpf_id',
    'fulfillment_flag',
    'pickup_done_time',
    'package_list',
    'shipping_carrier',
    'payment_method',
    'total_amount',
    'buyer_username',
    'invoice_data',
    'checkout_shipping_carrier',
    'reverse_shipping_fee',
    'order_chargeable_weight_gram',
  ];
}

function handleError(err: any) {
  return err.response ? err.response.data : { error: 'Unknown error' };
}

function getHeaders(config: ShopeeConfig, contentType = 'application/json') {
  return {
    'Content-Type': contentType,
  };
}

async function httpPost(url: string, body: any, headers: any) {
  try {
    const res: AxiosResponse = await axios.post(url, body, {
      headers,
    });
    return res.data;
  } catch (err: any) {
    return handleError(err);
  }
}

async function httpPostDownload(url: string, body: any, config: ShopeeConfig) {
  try {
    const res: AxiosResponse<ArrayBuffer> = await axios.post(url, body, {
      headers: getHeaders(config),
      responseType: 'arraybuffer',
      validateStatus: () => true,
    });

    const rawContentType = res.headers['content-type'];
    const contentType =
      typeof rawContentType === 'string'
        ? rawContentType
        : Array.isArray(rawContentType)
          ? rawContentType.join('; ')
          : undefined;
    const buffer =
      res.data instanceof Uint8Array ? res.data : new Uint8Array(res.data);

    if (contentType?.includes('application/json')) {
      return JSON.parse(new TextDecoder().decode(buffer));
    }

    const rawContentDisposition = res.headers['content-disposition'];
    const contentDisposition =
      typeof rawContentDisposition === 'string'
        ? rawContentDisposition
        : Array.isArray(rawContentDisposition)
          ? rawContentDisposition.join('; ')
          : undefined;
    const filenameMatch = /filename\*?=(?:UTF-8''|\")?([^\";]+)/i.exec(
      contentDisposition ?? '',
    );

    const rawContentLength = res.headers['content-length'];
    const contentLength =
      typeof rawContentLength === 'string' ||
      typeof rawContentLength === 'number'
        ? Number(rawContentLength)
        : buffer.byteLength;

    return {
      buffer,
      contentType,
      contentDisposition,
      filename: filenameMatch?.[1]
        ? decodeURIComponent(filenameMatch[1].replace(/^\"|\"$/g, ''))
        : undefined,
      contentLength,
    };
  } catch (err: any) {
    return handleError(err);
  }
}

async function httpPostMultipart(url: string, formData: FormData, headers?: Record<string, string>) {
  try {
    const res: AxiosResponse = await axios.post(url, formData, {
      headers,
    });
    return res.data;
  } catch (err: any) {
    return handleError(err);
  }
}

async function httpGet(url: string, config: ShopeeConfig) {
  try {
    const res: AxiosResponse = await axios.get(url, {
      headers: getHeaders(config),
    });
    return res.data;
  } catch (err: any) {
    return handleError(err);
  }
}

function isAccessTokenValid(time: any): boolean {
  const now = Math.floor(Date.now() / 1000);
  return time > now;
}

function isTokenExpired(time: any): boolean {
  if (time.toString().length === 13) {
    time = time / 1000;
  }
  const now = Math.floor(Date.now() / 1000);

  // If expiration time is less than or equal to current time, it's expired
  return time <= now;
}

function refreshTokenExpire30Days() {
  return getTimestampNow() + 30 * 24 * 60 * 60;
}

function buildOptionalParams(
  params?: Record<string, any>,
): Record<string, string | number | boolean> {
  if (!params) return {};

  return Object.fromEntries(
    Object.entries(params).filter(
      ([_, value]) => value !== undefined && value !== null,
    ),
  );
}

async function buildImageUploadFormData(returnSn: string, imagePath: string): Promise<FormData> {
  const extension = extname(imagePath).toLowerCase();
  const mimeType = SUPPORTED_IMAGE_MIME_TYPES[extension];

  if (!mimeType) {
    throw new Error('Shopee convert_image only supports .jpg, .jpeg, and .png files');
  }

  const imageBuffer = await readFile(imagePath);

  if (imageBuffer.byteLength > MAX_IMAGE_UPLOAD_SIZE) {
    throw new Error('Shopee convert_image only supports files up to 10MB');
  }

  const formData = new FormData();
  formData.append('return_sn', returnSn);
  formData.append(
    'upload_image',
    new Blob([imageBuffer], { type: mimeType }),
    basename(imagePath),
  );

  return formData;
}


export {
  buildCommonParameters,
  getTimestampMinutesAgo,
  signRequest,
  signRequestUrl,
  getTimestampNow,
  commonParameter,
  optionalField,
  httpGet,
  httpPost,
  httpPostDownload,
  httpPostMultipart,
  getHeaders,
  buildCommonParams,
  isAccessTokenValid,
  isTokenExpired,
  refreshTokenExpire30Days,
  buildOptionalParams,
  buildImageUploadFormData,
  buildCommonParametersWithTimeRange,
};
