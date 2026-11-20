export interface ShopeeEscrowOrderAdjustment {
  amount: number;
  date: number;
  currency: string;
  adjustment_reason: string;
}

export interface ShopeeEscrowItem {
  item_id?: number;
  item_name?: string;
  item_sku?: string;
  model_id?: number;
  model_name?: string;
  model_sku?: string;
  line_item_id?: number;
  original_price?: number;
  selling_price?: number;
  discounted_price?: number;
  seller_discount?: number;
  shopee_discount?: number;
  discount_from_coin?: number;
  discount_from_voucher_shopee?: number;
  discount_from_voucher_seller?: number;
  quantity_purchased?: number;
  /** Affiliate commission (AMS) charged on this item. */
  ams_commission_fee?: number;
  is_main_item?: boolean;
  [key: string]: any;
}

/**
 * Order income breakdown returned by `get_escrow_detail`.
 *
 * Amounts are in the shop currency unless the field ends with `_pri`
 * (Primary currency used for cross border settlements).
 */
export interface ShopeeEscrowOrderIncome {
  /** Amount the seller will receive (already net of every fee, discount and tax). */
  escrow_amount: number;
  escrow_amount_after_adjustment?: number;
  buyer_total_amount: number;

  /** Sum of item prices before any discount. */
  order_original_price?: number;
  original_price?: number;
  /** Sum of item prices after seller / shopee discounts. */
  order_selling_price?: number;
  order_discounted_price?: number;
  order_seller_discount?: number;

  seller_discount?: number;
  shopee_discount?: number;
  voucher_from_seller?: number;
  voucher_from_shopee?: number;
  voucher_from_external_party?: number;
  seller_voucher_code?: string[];
  coins?: number;
  seller_coin_cash_back?: number;

  /** Platform commission (Shopee VN "Phí cố định"). */
  commission_fee?: number;
  /** Service fee (Shopee VN "Phí dịch vụ"). */
  service_fee?: number;
  /** Payment / transaction fee (Shopee VN "Phí thanh toán"). */
  seller_transaction_fee?: number;
  buyer_transaction_fee?: number;
  /** Affiliate commission at order level. */
  order_ams_commission_fee?: number;
  campaign_fee?: number;
  seller_order_processing_fee?: number;
  fbs_fee?: number;
  sspl_fee?: number;
  pay_per_sale?: number;

  /** Single tax line used on Shopee VN ("Thuế"). */
  escrow_tax?: number;
  withholding_tax?: number;
  withholding_vat_tax?: number;
  withholding_pit_tax?: number;
  withholding_cit_tax?: number;
  final_product_vat_tax?: number;
  final_shipping_vat_tax?: number;
  cross_border_tax?: number;

  buyer_paid_shipping_fee?: number;
  estimated_shipping_fee?: number;
  actual_shipping_fee?: number;
  final_shipping_fee?: number;
  seller_shipping_discount?: number;
  shopee_shipping_rebate?: number;
  shipping_fee_discount_from_3pl?: number;
  /** Reverse (return) shipping fee charged to the seller. */
  reverse_shipping_fee?: number;
  final_return_to_seller_shipping_fee?: number;

  /** Amount refunded to the buyer for returned / refunded items. */
  seller_return_refund?: number;
  drc_adjustable_refund?: number;
  cost_of_goods_sold?: number;
  original_cost_of_goods_sold?: number;

  items?: ShopeeEscrowItem[];
  order_adjustment?: ShopeeEscrowOrderAdjustment[];
  total_adjustment_amount?: number;

  buyer_payment_method?: string;
  instalment_plan?: string;
  exchange_rate?: number;
  aff_currency?: string;
  pri_currency?: string;

  [key: string]: any;
}

export interface ShopeeBuyerPaymentInfo {
  buyer_payment_method?: string;
  buyer_service_fee?: number;
  buyer_tax_amount?: number;
  buyer_total_amount?: number;
  credit_card_promotion?: number;
  merchant_subtotal?: number;
  seller_voucher?: number;
  shopee_voucher?: number;
  shipping_fee?: number;
  shopee_coins_redeemed?: number;
  is_paid_by_credit_card?: boolean;
  [key: string]: any;
}

export interface ShopeeEscrowDetail {
  order_sn: string;
  buyer_user_name?: string;
  return_order_sn_list?: string[];
  order_income: ShopeeEscrowOrderIncome;
  buyer_payment_info?: ShopeeBuyerPaymentInfo;
}

export interface ShopeeResponseGetEscrowDetail {
  response: ShopeeEscrowDetail;
  request_id?: string;
  error?: string;
  message?: string;
}

export interface ShopeeEscrowDetailBatchItem {
  escrow_detail: ShopeeEscrowDetail;
}

export interface ShopeeResponseGetEscrowDetailBatch {
  response: ShopeeEscrowDetailBatchItem[];
  request_id?: string;
  error?: string;
  message?: string;
}

export interface ShopeeEscrowListItem {
  order_sn: string;
  /** Amount released to the seller for this order. */
  payout_amount: number;
  escrow_release_time: number;
}

export interface ShopeeResponseGetEscrowList {
  response: {
    escrow_list: ShopeeEscrowListItem[];
    more: boolean;
  };
  request_id?: string;
  error?: string;
  message?: string;
}

export interface ShopeeIncomeOverview {
  latest_payout_date?: string;
  total_income: {
    /** Local: orders before ESCROW_PAID. CB: orders before ESCROW_PAYOUT. */
    pending_amount: number;
    /** CB only: amount queued for the next payout cycle. */
    to_release_amount: number;
    /** Total amount already released to the seller. */
    released_amount: number;
  };
}

export interface ShopeeResponseGetIncomeOverview {
  response: ShopeeIncomeOverview;
  request_id?: string;
  error?: string;
  message?: string;
}

export interface ShopeeIncomeDetailItem {
  payment_method: string;
  order_sn: string;
  description: string;
  status: string;
  currency: string;
  estimated_escrow_amount: number;
  estimated_payout_time: number;
  to_release_amount: number;
  creation_date: number;
  released_amount: number;
  actual_payout_time: number;
}

export interface ShopeeResponseGetIncomeDetail {
  income_detail_list: {
    next_page?: {
      cursor: string;
      page_size: number;
    };
    income_detail_list_item: ShopeeIncomeDetailItem[];
  };
  request_id?: string;
  error?: string;
  message?: string;
}

export interface ShopeeResponseGenerateIncomeReport {
  response: {
    id: number;
  };
  request_id?: string;
  error?: string;
  msg?: string;
}

export enum ShopeeIncomeReportStatus {
  INVALID = 0,
  PROCESSING = 1,
  DOWNLOADABLE = 2,
  DOWNLOADED = 3,
}

export interface ShopeeResponseGetIncomeReport {
  response: {
    id: number;
    file_name: string;
    status: ShopeeIncomeReportStatus;
    generated_time: number;
    file_link: string;
  };
  request_id?: string;
  error?: string;
  msg?: string;
}

export interface ShopeeWalletTransaction {
  status?: string;
  transaction_type?: string;
  txn_title?: string;
  amount?: number;
  current_balance?: number;
  create_time?: number;
  order_sn?: string;
  refund_sn?: string;
  withdrawal_type?: string;
  transaction_fee?: number;
  description?: string;
  buyer_name?: string;
  shop_name?: string;
  withdrawal_id?: number;
  reason?: string;
  transaction_tab_type?: string;
  money_flow?: string;
}

export interface ShopeeResponseGetWalletTransactionList {
  response: {
    transaction_list: ShopeeWalletTransaction[];
    more: boolean;
  };
  request_id?: string;
  error?: string;
  message?: string;
}

export interface ShopeePayoutItem {
  from_currency?: string;
  payout_currency?: string;
  from_amount?: number;
  payout_amount?: number;
  exchange_rate?: string;
  payout_time?: number;
  pay_service?: string;
  payee_id?: string;
  encrypted_payout_id?: string;
}

export interface ShopeeResponseGetPayoutInfo {
  response: {
    payout_list: ShopeePayoutItem[];
    more: boolean;
    next_cursor?: string;
  };
  request_id?: string;
  error?: string;
  message?: string;
}
