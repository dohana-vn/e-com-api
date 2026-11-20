import { TIKTOK_PATH_FINANCE } from '../../common/constant';
import { TiktokConfig } from '../../dto/request/config.request';
import * as TiktokHelper from '../../common/helper';
import {
  TiktokGetOrderStatementTransactionsParams,
  TiktokGetPaymentsParams,
  TiktokGetStatementsParams,
  TiktokGetStatementTransactionsParams,
  TiktokGetUnsettledTransactionsParams,
  TiktokGetWithdrawalsParams,
} from '../../dto/request/finance.request';
import {
  TiktokFinanceResponse,
  TiktokPaymentListData,
  TiktokStatementListData,
  TiktokStatementTransactionListData,
  TiktokUnsettledTransactionListData,
  TiktokWithdrawalListData,
} from '../../dto/response/finance.response';

function buildUrl(
  path: string,
  query: Record<string, string | number | undefined>,
  config: TiktokConfig,
) {
  const timestamp = Math.floor(Date.now() / 1000);
  const commonParam = TiktokHelper.commonParameter3(config, query, timestamp);

  return TiktokHelper.genURLWithSignatureV2(path, commonParam, config);
}

/**
 * Statements generated for the shop, with the settlement summary per statement.
 * Only data after 2023-07-01 is available.
 */
export async function getStatements(
  params: TiktokGetStatementsParams,
  config: TiktokConfig,
): Promise<TiktokFinanceResponse<TiktokStatementListData>> {
  const url = buildUrl(TIKTOK_PATH_FINANCE.STATEMENTS, {
    statement_time_ge: params.statement_time_ge,
    statement_time_lt: params.statement_time_lt,
    payment_status: params.payment_status,
    page_size: params.page_size ?? 20,
    page_token: params.page_token,
    sort_field: params.sort_field ?? 'statement_time',
    sort_order: params.sort_order ?? 'ASC',
  }, config);

  return TiktokHelper.httpGet(url, config);
}

/**
 * Every transaction (order income / adjustment / reserve) of one statement.
 */
export async function getStatementTransactions(
  params: TiktokGetStatementTransactionsParams,
  config: TiktokConfig,
): Promise<TiktokFinanceResponse<TiktokStatementTransactionListData>> {
  const path = TIKTOK_PATH_FINANCE.STATEMENT_TRANSACTIONS.replace(
    '{statement_id}',
    params.statement_id,
  );

  const url = buildUrl(path, {
    page_size: params.page_size ?? 20,
    page_token: params.page_token,
  }, config);

  return TiktokHelper.httpGet(url, config);
}

/**
 * SKU level income / fee breakdown of a single order
 * (equivalent of Shopee `get_escrow_detail`, includes the full fee columns).
 */
export async function getOrderStatementTransactions(
  params: TiktokGetOrderStatementTransactionsParams,
  config: TiktokConfig,
): Promise<TiktokFinanceResponse<TiktokStatementTransactionListData>> {
  const path = TIKTOK_PATH_FINANCE.ORDER_STATEMENT_TRANSACTIONS.replace(
    '{order_id}',
    params.order_id,
  );

  const url = buildUrl(path, {
    page_size: params.page_size ?? 20,
    page_token: params.page_token,
  }, config);

  return TiktokHelper.httpGet(url, config);
}

/**
 * Automated payments, used to reconcile statements with the seller bank account.
 * Currently unavailable for SEA markets.
 */
export async function getPayments(
  params: TiktokGetPaymentsParams,
  config: TiktokConfig,
): Promise<TiktokFinanceResponse<TiktokPaymentListData>> {
  const url = buildUrl(TIKTOK_PATH_FINANCE.PAYMENTS, {
    create_time_ge: params.create_time_ge,
    create_time_lt: params.create_time_lt,
    page_size: params.page_size ?? 20,
    page_token: params.page_token,
    sort_field: params.sort_field ?? 'create_time',
    sort_order: params.sort_order ?? 'ASC',
  }, config);

  return TiktokHelper.httpGet(url, config);
}

export async function getWithdrawals(
  params: TiktokGetWithdrawalsParams,
  config: TiktokConfig,
): Promise<TiktokFinanceResponse<TiktokWithdrawalListData>> {
  const url = buildUrl(TIKTOK_PATH_FINANCE.WITHDRAWALS, {
    create_time_ge: params.create_time_ge,
    create_time_lt: params.create_time_lt,
    page_size: params.page_size ?? 20,
    page_token: params.page_token,
    sort_field: params.sort_field ?? 'create_time',
    sort_order: params.sort_order ?? 'ASC',
  }, config);

  return TiktokHelper.httpGet(url, config);
}

/**
 * Orders that are not settled yet (with the estimated fee / revenue breakdown).
 */
export async function getUnsettledTransactions(
  params: TiktokGetUnsettledTransactionsParams,
  config: TiktokConfig,
): Promise<TiktokFinanceResponse<TiktokUnsettledTransactionListData>> {
  const url = buildUrl(TIKTOK_PATH_FINANCE.UNSETTLED_TRANSACTIONS, {
    create_time_ge: params.create_time_ge,
    create_time_lt: params.create_time_lt,
    page_size: params.page_size ?? 20,
    page_token: params.page_token,
    sort_field: params.sort_field ?? 'create_time',
    sort_order: params.sort_order ?? 'ASC',
  }, config);

  return TiktokHelper.httpGet(url, config);
}
