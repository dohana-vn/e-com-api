/**
 * TikTok Shop finance responses.
 *
 * Every monetary value is a decimal string (e.g. "-30.50"), unlike Shopee
 * which returns numbers. Convert to minor units before persisting.
 */

export interface TiktokMoney {
  value: string;
  currency: string;
}

export interface TiktokFinanceResponse<T> {
  code: number;
  message: string;
  request_id?: string;
  data: T;
}

export interface TiktokStatement {
  id: string;
  statement_time: number;
  /** Amount settlement after reserve and adjustments. */
  settlement_amount: string;
  currency: string;
  revenue_amount: string;
  fee_amount: string;
  adjustment_amount: string;
  net_sales_amount: string;
  shipping_cost_amount: string;
  payment_status: 'PAID' | 'FAILED' | 'PROCESSING';
  payment_id?: string;
  payment_time?: number;
}

export interface TiktokStatementListData {
  statements: TiktokStatement[];
  next_page_token?: string;
}

export interface TiktokRevenueBreakdown {
  subtotal_before_discount_amount?: string;
  seller_discount_amount?: string;
  refund_subtotal_before_discount_amount?: string;
  seller_discount_refund_amount?: string;
  cod_service_fee_amount?: string;
  refund_cod_service_fee_amount?: string;
  distant_item_fee_amount?: string;
  [key: string]: string | undefined;
}

export interface TiktokShippingCostBreakdown {
  actual_shipping_fee_amount?: string;
  shipping_fee_discount_amount?: string;
  customer_paid_shipping_fee_amount?: string;
  return_shipping_fee_amount?: string;
  replacement_shipping_fee_amount?: string;
  exchange_shipping_fee_amount?: string;
  signature_confirmation_fee_amount?: string;
  shipping_insurance_fee_amount?: string;
  distant_shipping_fee_amount?: string;
  shipping_app_service_fee_amount?: string;
  logistics_service_fee?: string;
  supplementary_component?: Record<string, string>;
  [key: string]: any;
}

export interface TiktokFeeBreakdown {
  platform_commission_amount?: string;
  referral_fee_amount?: string;
  transaction_fee_amount?: string;
  credit_card_handling_fee_amount?: string;
  affiliate_commission_amount?: string;
  affiliate_partner_commission_amount?: string;
  affiliate_ads_commission_amount?: string;
  sfp_service_fee_amount?: string;
  live_specials_fee_amount?: string;
  mall_service_fee_amount?: string;
  voucher_xtra_service_fee_amount?: string;
  flash_sales_service_fee_amount?: string;
  cofunded_promotion_service_fee_amount?: string;
  pre_order_service_fee_amount?: string;
  dynamic_commission_amount?: string;
  external_affiliate_marketing_fee_amount?: string;
  /** VN specific fixed infrastructure fee. */
  vn_fix_infrastructure_fee?: string;
  [key: string]: string | undefined;
}

export interface TiktokTaxBreakdown {
  vat_amount?: string;
  import_vat_amount?: string;
  customs_duty_amount?: string;
  pit_amount?: string;
  [key: string]: string | undefined;
}

export interface TiktokFeeTaxBreakdown {
  fee?: TiktokFeeBreakdown;
  tax?: TiktokTaxBreakdown;
  [key: string]: any;
}

export interface TiktokStatementTransaction {
  id: string;
  type: string;
  order_id?: string;
  order_create_time?: number;
  adjustment_id?: string;
  adjustment_order_id?: string;
  adjustment_amount?: string;
  settlement_amount?: string;
  revenue_amount?: string;
  revenue_breakdown?: TiktokRevenueBreakdown;
  shipping_cost_amount?: string;
  shipping_cost_breakdown?: TiktokShippingCostBreakdown;
  fee_tax_amount?: string;
  fee_tax_breakdown?: TiktokFeeTaxBreakdown;
  supplementary_component?: Record<string, string>;
  reserve_id?: string;
  reserve_amount?: string;
  associated_order_id?: string;
  reserve_status?: string;
  estimated_release_time?: number;
}

export interface TiktokStatementTransactionListData {
  id: string;
  create_time: number;
  status: string;
  currency: string;
  payable_amount: string;
  total_reserve_amount?: string;
  total_settlement_amount?: string;
  total_settlement_breakdown?: {
    total_revenue_amount?: string;
    total_shipping_cost_amount?: string;
    total_fee_tax_amount?: string;
    total_adjustment_amount?: string;
  };
  total_count?: number;
  transactions: TiktokStatementTransaction[];
  next_page_token?: string;
}

export interface TiktokPayment {
  id: string;
  create_time: number;
  status: 'PAID' | 'FAILED' | 'PROCESSING';
  amount?: TiktokMoney;
  settlement_amount?: TiktokMoney;
  payment_amount_before_exchange?: TiktokMoney;
  exchange_rate?: string;
  paid_time?: number;
  bank_account?: string;
}

export interface TiktokPaymentListData {
  payments: TiktokPayment[];
  next_page_token?: string;
}

export interface TiktokWithdrawal {
  id: string;
  type: string;
  amount: string;
  currency: string;
  status: string;
  create_time: number;
}

export interface TiktokWithdrawalListData {
  withdrawals: TiktokWithdrawal[];
  total_count?: number;
  next_page_token?: string;
}

export interface TiktokUnsettledTransaction {
  type: string;
  id: string;
  status: string;
  currency: string;
  estimated_settlement?: number;
  unsettled_reason?: string;
  order_create_time?: number;
  order_delivery_time?: number;
  order_id?: string;
  adjustment_id?: string;
  adjustment_order_id?: string;
  est_adjustment_amount?: string;
  est_settlement_amount?: string;
  est_revenue_amount?: string;
  revenue_breakdown?: TiktokRevenueBreakdown;
  est_shipping_cost_amount?: string;
  shipping_cost_breakdown?: TiktokShippingCostBreakdown;
  est_fee_tax_amount?: string;
  fee_tax_breakdown?: TiktokFeeTaxBreakdown;
}

export interface TiktokUnsettledTransactionListData {
  transactions: TiktokUnsettledTransaction[];
  total_count?: number;
  next_page_token?: string;
  sum_est_settlement_amount?: string;
  sum_est_revenue_amount?: string;
  sum_est_adjustment_amount?: string;
  sum_est_fee_amount?: string;
}
