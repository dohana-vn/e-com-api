import * as ShopeeHelper from '../common/helper';
import { SHOPEE_END_POINT, SHOPEE_PATH } from '../common/constant';
import { ShopeeConfig } from '../dto/request/config.request';
import {
  ShopeeResponseLogisticChannelList,
  ShopeeResponseShipOrder,
  ShopeeResponseShippingParameter,
} from '../dto/response/logistic.reponse';
import { ShopeeRequestShipOrder } from '../dto/request/logistic.request';

/**
 *
 * @param itemIds - Product IDs.
 * @param statusUnlist - Unlist status.
 * @param config - Shopee API configuration.
 * @returns {Promise<ShopeeResponseGetCategories>}
 */
export async function getChannelList(config: ShopeeConfig): Promise<ShopeeResponseLogisticChannelList> {
  const timestamp = ShopeeHelper.getTimestampNow();
  const signature = ShopeeHelper.signRequest(SHOPEE_PATH.CHANNEL_LIST, config, timestamp);
  const commonParam = ShopeeHelper.commonParameter(config, signature, timestamp);

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

