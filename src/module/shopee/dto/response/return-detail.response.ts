export interface ShopeeReturnUser {
  username: string;
  email?: string;
  portrait?: string;
}

export interface ShopeeReturnItem {
  item_id: number;
  model_id: number;
  name: string;
  images: string[];

  amount: number;
  item_price: number;
  refund_amount?: number;

  is_add_on_deal: boolean;
  is_main_item: boolean;

  item_sku: string;
  variation_sku: string;
  add_on_deal_id: number;
  hot_listing_item: boolean;
}

export interface ShopeeReturnNegotiation {
  latest_solution: string;
}

export interface ShopeeReturnDetail {
  return_sn: string;
  order_sn: string;

  status: string;
  negotiation_status: string;

  create_time: number;
  update_time: number;
  due_date?: number;

  refund_amount: number;
  currency: string;
  amount_before_discount: number;

  reason: string;
  text_reason?: string;
  reassessed_request_reason?: string;

  tracking_number?: string;
  needs_logistics: boolean;

  user?: ShopeeReturnUser;
  item: ShopeeReturnItem[];

  return_ship_due_date?: number;
  return_seller_due_date?: number;

  seller_proof_status?: string;
  seller_compensation_status?: string;

  hot_listing_order: boolean;

  return_refund_type: string;
  return_solution: number;
  return_refund_request_type: number;

  validation_type?: string;
  is_seller_arrange: boolean;
  is_shipping_proof_mandatory: boolean;
  is_arrived_at_warehouse: number;

  seller_evidence_deadline?: number | null;
  negotiation?: ShopeeReturnNegotiation;

  image?: string[];
  buyer_videos?: string[];

  follow_up_action_list?: any;
}

export interface ShopeeReturnListItem {
  return_sn: string;
  order_sn: string;
  status: string;
  negotiation_status: string;
  create_time: number;
  update_time: number;
}

export interface ShopeeResponseGetReturnList {
  request_id?: string;
  error?: string;
  message?: string;
  response?: {
    return_list: ShopeeReturnListItem[];
    more: boolean;
  };
}

export interface ShopeeResponseGetReturnDetail {
  request_id?: string;
  error?: string;
  message?: string;
  response?: ShopeeReturnDetail;
}
