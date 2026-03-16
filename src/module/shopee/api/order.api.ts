import axios from 'axios';
import { SHOPEE_END_POINT, SHOPEE_PATH } from '../common/constant';
import { ShopeeConfig } from '../dto/request/config.request';
import * as ShopeeHelper from '../common/helper';
import { ShopeeResponseOrderDetail } from '../dto/response/order.response';

/**
 * Get orders
 * @param beforeMinutes
 * @param config
 * @returns
 */
export async function getOrders(beforeMinutes: number, config: ShopeeConfig) {
  let cursor = '';
  const orderList: string[] = [];
  let hasMoreData = true;
  const timeFrom = ShopeeHelper.getTimestampMinutesAgo(beforeMinutes);

  while (hasMoreData) {
    const timestamp = ShopeeHelper.getTimestampNow();
    const signature = ShopeeHelper.signRequest(SHOPEE_PATH.ORDER_LIST, config, timestamp);
    const commonParams = ShopeeHelper.buildCommonParameters(config, signature, timestamp, timeFrom, cursor);

    const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.ORDER_LIST}${commonParams}`;
    const res = await axios.get(url);
    if (res.data?.respone?.order_list.length < 1) break;
    orderList.push(...res.data.response.order_list);

    cursor = res.data.response.next_cursor;
    hasMoreData = res.data.response.more;
  }

  return orderList.map((item: any) => item.order_sn);
}

export async function getOrdersV2(
  config: ShopeeConfig,
  timeFrom: number,
  timeTo: number,
) {
  let cursor = '';
  const orderList: string[] = [];
  let hasMoreData = true;

  while (hasMoreData) {
    const timestamp = ShopeeHelper.getTimestampNow();

    const signature = ShopeeHelper.signRequest(
      SHOPEE_PATH.ORDER_LIST,
      config,
      timestamp,
    );

    const commonParams = ShopeeHelper.buildCommonParameters(
      config,
      signature,
      timeTo,
      timeFrom,
      cursor,
    );

    const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.ORDER_LIST}${commonParams}`;

    const res = await axios.get(url);

    if (!res.data?.response?.order_list?.length) break;

    orderList.push(...res.data.response.order_list);

    cursor = res.data.response.next_cursor;
    hasMoreData = res.data.response.more;
  }

  return orderList.map((item: any) => item.order_sn);
}

/**
 *
 * @param orderNumber
 * @param config
 * @returns
 */
export async function getOrderDetail(orderNumber: string, config: ShopeeConfig): Promise<ShopeeResponseOrderDetail> {
  const timestamp = ShopeeHelper.getTimestampNow();
  const optionalField = ShopeeHelper.optionalField();
  const signature = ShopeeHelper.signRequest(SHOPEE_PATH.ORDER_DETAIL, config, timestamp);
  // const commonParam = `${ShopeeHelper.commonParameter(config, signature, timestamp)}&order_sn_list=${orderNumber}&response_optional_fields=${optionalField.join(',')}`;
  const additionalParams = {
    order_sn_list: orderNumber,
    response_optional_fields: optionalField.join(','),
  };

  const commonParam = ShopeeHelper.buildCommonParams(config, signature, timestamp, additionalParams);
  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.ORDER_DETAIL}${commonParam}`;

  return ShopeeHelper.httpGet(url, config);
}

export async function getOrderDetails(
  orderSns: string[],
  config: ShopeeConfig,
): Promise<any> {
  if (!orderSns.length) {
    throw new Error('orderSns is empty');
  }

  if (orderSns.length > 50) {
    throw new Error('Shopee only allows max 50 order_sn per request');
  }

  const timestamp = ShopeeHelper.getTimestampNow();
  const optionalField = ShopeeHelper.optionalField();
  const signature = ShopeeHelper.signRequest(
    SHOPEE_PATH.ORDER_DETAIL,
    config,
    timestamp,
  );

  const additionalParams = {
    order_sn_list: orderSns.join(','),
    response_optional_fields: optionalField.join(','),
  };

  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
    additionalParams,
  );

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.ORDER_DETAIL}${commonParam}`;

  return ShopeeHelper.httpGet(url, config);
}

/**
 * Get package detail by package number list
 * @param packageNumbers
 * @param config
 * @returns
 */
export async function getPackageNumberDetail(
  packageNumbers: string[],
  config: ShopeeConfig,
): Promise<any> {
  if (!packageNumbers.length) {
    throw new Error('packageNumbers is empty');
  }

  if (packageNumbers.length > 50) {
    throw new Error('Shopee only allows max 50 package_number per request');
  }

  const timestamp = ShopeeHelper.getTimestampNow();

  const signature = ShopeeHelper.signRequest(
    SHOPEE_PATH.PACKAGE_DETAIL,
    config,
    timestamp,
  );

  const additionalParams = {
    package_number_list: packageNumbers.join(','),
  };

  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
    additionalParams,
  );

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.PACKAGE_DETAIL}${commonParam}`;

  return ShopeeHelper.httpGet(url, config);
}