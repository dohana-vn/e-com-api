import { TiktokConfig } from '../../dto/request/config.request';
import { TIKTOK_PATH_202309, TIKTOK_PATH_PLACEHOLDER } from '../../common/constant';
import * as TiktokHelper from '../../common/helper';
import { TiktokResponseOrderDetail } from '../../dto/response/order.response';
import { TiktokRequestShipPackage } from '../../dto/request/fulfillment.request';

/**
 *
 * @param orderNumber The order number.
 * @param config Tiktok API configuration.
 * @returns The response containing the order detail.
 */
export async function getOrderDetail(orderNumber: string, config: TiktokConfig): Promise<TiktokResponseOrderDetail> {
  const timestamp = Math.floor(Date.now() / 1000);
  const commonParam = `${TiktokHelper.commonParameter2(config, timestamp)}&ids=${orderNumber}`;

  const url = TiktokHelper.genURLWithSignature(TIKTOK_PATH_202309.ORDER_DETAIL, commonParam, config);

  return TiktokHelper.httpGet(url, config);
}

/**
 * Fetches the list of order.
 * @param {TiktokConfig} config - Tiktok API configuration.
 * @returns {Promise<any>} The response containing the list of order.
 */
export async function getOrderList(before: number, params: {page_size: number;page_token?: string}, config: TiktokConfig): Promise<any> {
  const timestamp = Math.floor(Date.now() / 1000);
  const commonParam = TiktokHelper.commonParameter3(config, {page_size: params.page_size, page_token: params.page_token, version: '202309'}, timestamp);

  const body = {
    update_time_ge: before,
  };

  const url = TiktokHelper.genURLWithSignatureV2(TIKTOK_PATH_202309.ORDER_LIST, commonParam, config, body);

  const headers = TiktokHelper.getHeaders(config);

  return TiktokHelper.httpPost(url, body, headers);
}

export async function getOrdersByCreateTimeRange(
  timeFrom: number,
  timeTo: number,
  params: { page_size: number; page_token?: string },
  config: TiktokConfig,
): Promise<any> {
  const timestamp = Math.floor(Date.now() / 1000);

  const commonParam = TiktokHelper.commonParameter3(
    config,
    {
      page_size: params.page_size,
      page_token: params.page_token,
      version: '202309',
    },
    timestamp,
  );

  const body = {
    create_time_ge: Number(timeFrom),
    create_time_lt: Number(timeTo),
  };

  const url = TiktokHelper.genURLWithSignatureV2(
    TIKTOK_PATH_202309.ORDER_LIST,
    commonParam,
    config,
    body,
  );

  console.log('body', JSON.stringify(body));
  console.log('url', url);

  const headers = TiktokHelper.getHeaders(config);

  return TiktokHelper.httpPost(url, body, headers);
}

/**
 *
 * @param packageId - Package ID.
 * @param payload - Payload.
 * @param config - Tiktok API configuration.
 * @returns {Promise<any>}
 */
export async function shipPackage(packageId: string, payload: TiktokRequestShipPackage, config: TiktokConfig): Promise<any> {
  if (!packageId) {
    throw new Error('Invalid input: packageId are required');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const commonParam = TiktokHelper.commonParameter2(config, timestamp);
  const pathTimeSlot = TiktokHelper.replacePlaceholder(TIKTOK_PATH_202309.SHIP_PACKAGE, TIKTOK_PATH_PLACEHOLDER.PACKAGE, packageId);

  const url = TiktokHelper.genURLWithSignature(pathTimeSlot, commonParam, config);

  const body: TiktokRequestShipPackage = {
    handover_method: payload.handover_method,
    pickup_slot: {
      start_time: payload.pickup_slot.start_time,
      end_time: payload.pickup_slot.end_time,
    },
  };

  const headers = TiktokHelper.getHeaders(config);

  return TiktokHelper.httpPost(url, body, headers);
}
