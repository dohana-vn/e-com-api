/**
 * Seller income payout status.
 *
 * Local shop: 1 = Released, 2 = Pending
 * Cross Border shop: 0 = To Release, 1 = Released, 2 = Pending
 */
export enum ShopeeIncomeStatus {
  TO_RELEASE = 0,
  RELEASED = 1,
  PENDING = 2,
}

export interface ShopeeGetEscrowDetailRequest {
  /** Shopee's unique identifier for an order. */
  orderSn: string;
}

export interface ShopeeGetEscrowDetailBatchRequest {
  /**
   * Shopee's unique identifier for an order.
   * Limit [1, 50]. Shopee recommends 1 - 20 orders per request.
   */
  orderSnList: string[];
}

export interface ShopeeGetEscrowListRequest {
  /** Query start time (epoch seconds). */
  releaseTimeFrom: number;

  /** Query end time (epoch seconds). */
  releaseTimeTo: number;

  /** Page number, min 1, default 1. */
  pageNo?: number;

  /** Page size, max 100, default 40. */
  pageSize?: number;
}

export interface ShopeeGetIncomeOverviewRequest {
  /** Optional. Omit to receive every income status of the shop. */
  incomeStatus?: ShopeeIncomeStatus;
}

export interface ShopeeGetIncomeDetailRequest {
  /** Start date (YYYY-MM-DD) of the income reference period. */
  dateFrom: string;

  /** End date (YYYY-MM-DD). Must be later than dateFrom. Max range 14 days. */
  dateTo: string;

  /** Required by the API. */
  incomeStatus: ShopeeIncomeStatus;

  /** Pagination token, empty string for the first request. */
  cursor?: string;

  /** Number of records per page. */
  pageSize: number;
}

export interface ShopeeGenerateIncomeReportRequest {
  /** Query start time (epoch seconds). */
  releaseTimeFrom: number;

  /** Query end time (epoch seconds). */
  releaseTimeTo: number;
}

export interface ShopeeGetIncomeReportRequest {
  /** Identifier returned by generate_income_report. */
  incomeReportId: number;
}

export interface ShopeeGetWalletTransactionListRequest {
  pageNo: number;

  /** Max 100. */
  pageSize: number;

  createTimeFrom?: number;

  createTimeTo?: number;

  walletType?: string;

  transactionType?: string;

  moneyFlow?: string;

  transactionTabType?: string;
}

export interface ShopeeGetPayoutInfoRequest {
  /** Maximum time range is 15 days. */
  payoutTimeFrom: number;

  payoutTimeTo: number;

  /** Max 100. */
  pageSize: number;

  /** Empty string for the first request. */
  cursor: string;
}
