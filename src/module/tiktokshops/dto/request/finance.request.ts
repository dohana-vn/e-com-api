export interface TiktokGetStatementsParams {
  /** Filter statements generated on or after this time (epoch seconds). */
  statement_time_ge?: number;

  /** Filter statements generated before this time (epoch seconds). */
  statement_time_lt?: number;

  /** PAID | FAILED | PROCESSING */
  payment_status?: 'PAID' | 'FAILED' | 'PROCESSING';

  /** Valid range [1, 100], default 20. */
  page_size?: number;

  page_token?: string;

  /** Currently only `statement_time` is supported. */
  sort_field?: 'statement_time';

  sort_order?: 'ASC' | 'DESC';
}

export interface TiktokGetStatementTransactionsParams {
  statement_id: string;

  page_size?: number;

  page_token?: string;
}

export interface TiktokGetOrderStatementTransactionsParams {
  order_id: string;

  page_size?: number;

  page_token?: string;
}

export interface TiktokGetPaymentsParams {
  /** Filter payments created on or after this time (epoch seconds). */
  create_time_ge?: number;

  /** Filter payments created before this time (epoch seconds). */
  create_time_lt?: number;

  /** Valid range [1, 100], default 20. */
  page_size?: number;

  page_token?: string;

  /** Currently only `create_time` is supported. */
  sort_field?: 'create_time';

  sort_order?: 'ASC' | 'DESC';
}

export interface TiktokGetWithdrawalsParams {
  /** Filter withdrawals created on or after this time (epoch seconds). */
  create_time_ge?: number;

  /** Filter withdrawals created before this time (epoch seconds). */
  create_time_lt?: number;

  page_size?: number;

  page_token?: string;

  sort_field?: 'create_time';

  sort_order?: 'ASC' | 'DESC';
}

export interface TiktokGetUnsettledTransactionsParams {
  /** Filter transactions created on or after this time (epoch seconds). */
  create_time_ge?: number;

  /** Filter transactions created before this time (epoch seconds). */
  create_time_lt?: number;

  page_size?: number;

  page_token?: string;

  sort_field?: 'create_time';

  sort_order?: 'ASC' | 'DESC';
}
