import { SHOPEE_END_POINT, SHOPEE_PATH } from '../common/constant';
import { ShopeeConfig } from '../dto/request/config.request';
import * as ShopeeHelper from '../common/helper';
import {
  ShopeeGenerateIncomeReportRequest,
  ShopeeGetEscrowDetailBatchRequest,
  ShopeeGetEscrowDetailRequest,
  ShopeeGetEscrowListRequest,
  ShopeeGetIncomeDetailRequest,
  ShopeeGetIncomeOverviewRequest,
  ShopeeGetIncomeReportRequest,
  ShopeeGetPayoutInfoRequest,
  ShopeeGetWalletTransactionListRequest,
  ShopeeResponseGenerateIncomeReport,
  ShopeeResponseGetEscrowDetail,
  ShopeeResponseGetEscrowDetailBatch,
  ShopeeResponseGetEscrowList,
  ShopeeResponseGetIncomeDetail,
  ShopeeResponseGetIncomeOverview,
  ShopeeResponseGetIncomeReport,
  ShopeeResponseGetPayoutInfo,
  ShopeeResponseGetWalletTransactionList,
} from '../dto';

/**
 * Use this API to fetch the accounting detail of an order.
 * This is the only endpoint that returns the full fee breakdown
 * (commission / service / transaction / affiliate / tax) of an order.
 */
export async function getEscrowDetail(
  params: ShopeeGetEscrowDetailRequest,
  config: ShopeeConfig,
): Promise<ShopeeResponseGetEscrowDetail> {
  const timestamp = ShopeeHelper.getTimestampNow();
  const signature = ShopeeHelper.signRequest(
    SHOPEE_PATH.ESCROW_DETAIL,
    config,
    timestamp,
  );

  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
    { order_sn: params.orderSn },
  );

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.ESCROW_DETAIL}${commonParam}`;

  return ShopeeHelper.httpGet(url, config);
}

/**
 * Use this API to fetch the accounting detail of multiple orders in a single call.
 * Limit [1, 50]. Shopee recommends 1 - 20 orders per request.
 */
export async function getEscrowDetailBatch(
  params: ShopeeGetEscrowDetailBatchRequest,
  config: ShopeeConfig,
): Promise<ShopeeResponseGetEscrowDetailBatch> {
  if (!params.orderSnList?.length) {
    throw new Error('orderSnList is empty');
  }

  if (params.orderSnList.length > 50) {
    throw new Error('Shopee only allows max 50 order_sn per escrow batch request');
  }

  const timestamp = ShopeeHelper.getTimestampNow();
  const signature = ShopeeHelper.signRequest(
    SHOPEE_PATH.ESCROW_DETAIL_BATCH,
    config,
    timestamp,
  );

  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
  );

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.ESCROW_DETAIL_BATCH}${commonParam}`;

  return ShopeeHelper.httpPost(
    url,
    { order_sn_list: params.orderSnList },
    ShopeeHelper.getHeaders(config),
  );
}

/**
 * Use this API to fetch the accounting (payout) list of orders released within a time range.
 */
export async function getEscrowList(
  params: ShopeeGetEscrowListRequest,
  config: ShopeeConfig,
): Promise<ShopeeResponseGetEscrowList> {
  const timestamp = ShopeeHelper.getTimestampNow();
  const signature = ShopeeHelper.signRequest(
    SHOPEE_PATH.ESCROW_LIST,
    config,
    timestamp,
  );

  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
    ShopeeHelper.buildOptionalParams({
      release_time_from: params.releaseTimeFrom,
      release_time_to: params.releaseTimeTo,
      page_no: params.pageNo ?? 1,
      page_size: params.pageSize ?? 40,
    }),
  );

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.ESCROW_LIST}${commonParam}`;

  return ShopeeHelper.httpGet(url, config);
}

/**
 * Consolidated snapshot of the seller's income grouped by payout status
 * (same numbers as Seller Center "Income Overview").
 */
export async function getIncomeOverview(
  params: ShopeeGetIncomeOverviewRequest,
  config: ShopeeConfig,
): Promise<ShopeeResponseGetIncomeOverview> {
  const timestamp = ShopeeHelper.getTimestampNow();
  const signature = ShopeeHelper.signRequest(
    SHOPEE_PATH.INCOME_OVERVIEW,
    config,
    timestamp,
  );

  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
    ShopeeHelper.buildOptionalParams({
      income_status: params.incomeStatus,
    }),
  );

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.INCOME_OVERVIEW}${commonParam}`;

  return ShopeeHelper.httpGet(url, config);
}

/**
 * Order level income records per payout status (same data as Seller Center "Income Details").
 * When incomeStatus = RELEASED the date range must not exceed 14 days.
 */
export async function getIncomeDetail(
  params: ShopeeGetIncomeDetailRequest,
  config: ShopeeConfig,
): Promise<ShopeeResponseGetIncomeDetail> {
  const timestamp = ShopeeHelper.getTimestampNow();
  const signature = ShopeeHelper.signRequest(
    SHOPEE_PATH.INCOME_DETAIL,
    config,
    timestamp,
  );

  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
    ShopeeHelper.buildOptionalParams({
      date_from: params.dateFrom,
      date_to: params.dateTo,
      income_status: params.incomeStatus,
      cursor: params.cursor ?? '',
      page_size: params.pageSize,
    }),
  );

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.INCOME_DETAIL}${commonParam}`;

  return ShopeeHelper.httpGet(url, config);
}

/**
 * Trigger the generation of an income report file (order level, contains every fee column).
 * Poll `getIncomeReport` until status = DOWNLOADABLE, then download `file_link`.
 */
export async function generateIncomeReport(
  params: ShopeeGenerateIncomeReportRequest,
  config: ShopeeConfig,
): Promise<ShopeeResponseGenerateIncomeReport> {
  const timestamp = ShopeeHelper.getTimestampNow();
  const signature = ShopeeHelper.signRequest(
    SHOPEE_PATH.GENERATE_INCOME_REPORT,
    config,
    timestamp,
  );

  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
    ShopeeHelper.buildOptionalParams({
      release_time_from: params.releaseTimeFrom,
      release_time_to: params.releaseTimeTo,
    }),
  );

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.GENERATE_INCOME_REPORT}${commonParam}`;

  return ShopeeHelper.httpGet(url, config);
}

export async function getIncomeReport(
  params: ShopeeGetIncomeReportRequest,
  config: ShopeeConfig,
): Promise<ShopeeResponseGetIncomeReport> {
  const timestamp = ShopeeHelper.getTimestampNow();
  const signature = ShopeeHelper.signRequest(
    SHOPEE_PATH.GET_INCOME_REPORT,
    config,
    timestamp,
  );

  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
    { income_report_id: params.incomeReportId },
  );

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.GET_INCOME_REPORT}${commonParam}`;

  return ShopeeHelper.httpGet(url, config);
}

export async function getWalletTransactionList(
  params: ShopeeGetWalletTransactionListRequest,
  config: ShopeeConfig,
): Promise<ShopeeResponseGetWalletTransactionList> {
  const timestamp = ShopeeHelper.getTimestampNow();
  const signature = ShopeeHelper.signRequest(
    SHOPEE_PATH.WALLET_TRANSACTION_LIST,
    config,
    timestamp,
  );

  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
    ShopeeHelper.buildOptionalParams({
      page_no: params.pageNo,
      page_size: params.pageSize,
      create_time_from: params.createTimeFrom,
      create_time_to: params.createTimeTo,
      wallet_type: params.walletType,
      transaction_type: params.transactionType,
      money_flow: params.moneyFlow,
      transaction_tab_type: params.transactionTabType,
    }),
  );

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.WALLET_TRANSACTION_LIST}${commonParam}`;

  return ShopeeHelper.httpGet(url, config);
}

/**
 * Cross Border shops only. Maximum time range is 15 days.
 */
export async function getPayoutInfo(
  params: ShopeeGetPayoutInfoRequest,
  config: ShopeeConfig,
): Promise<ShopeeResponseGetPayoutInfo> {
  const timestamp = ShopeeHelper.getTimestampNow();
  const signature = ShopeeHelper.signRequest(
    SHOPEE_PATH.PAYOUT_INFO,
    config,
    timestamp,
  );

  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
    ShopeeHelper.buildOptionalParams({
      payout_time_from: params.payoutTimeFrom,
      payout_time_to: params.payoutTimeTo,
      page_size: params.pageSize,
      cursor: params.cursor,
    }),
  );

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.PAYOUT_INFO}${commonParam}`;

  return ShopeeHelper.httpGet(url, config);
}
