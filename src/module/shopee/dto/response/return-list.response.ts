export interface ShopeeReturnItem {
  return_sn: string;
  return_id: number;
  order_sn: string;
  status: string;
  negotiation_status: string;
  create_time: number;
  update_time: number;
}

export interface ShopeeResponseGetReturnList {
  response: {
    more: boolean;
    ['return']: ShopeeReturnItem[];
  };
  error?: string;
  message?: string;
}
