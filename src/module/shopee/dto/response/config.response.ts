interface ResponseGetAccessToken {
  access_token: string;
  refresh_token: string;
  expire_in: number;
  message: string;
  request_id: string;
  error: string;
  merchant_id_list: number[];
  shop_id_list: number[];
}

interface ResponseRefreshAccessToken extends ResponseGetAccessToken {
  shop_id: string;
  partner_id: string;
}

interface ShopProfile {
  shop_logo: string;
  description: string;
  shop_name: string;
  invoice_issuer: string;
}

interface ShopInfoSipAffiliateShop {
  affi_shop_id: number;
  region: string;
  is_cb: boolean;
}

interface ShopInfoLinkedDirectShop {
  direct_shop_id: number;
  direct_shop_region: string;
}

interface ShopInfoOutletShop {
  outlet_shop_id: number;
}

interface ResponseCommon<T> {
  request_id: string;
  error: string;
  message: string;
  response: T;
}

interface ResponseShopProfile extends ResponseCommon<ShopProfile> {}

interface ResponseShopInfo {
  request_id: string;
  error: string;
  message: string;
  auth_time: number;
  expire_time: number;
  shop_name: string;
  region: string;
  status: string;
  shop_fulfillment_flag?: string;
  is_cb?: boolean;
  is_upgraded_cbsc?: boolean;
  merchant_id: number | null;
  is_sip?: boolean;
  sip_affi_shops?: ShopInfoSipAffiliateShop[];
  is_main_shop?: boolean;
  is_direct_shop?: boolean;
  linked_main_shop_id?: number | null;
  linked_direct_shop_list?: ShopInfoLinkedDirectShop[];
  is_one_awb?: boolean;
  is_mart_shop?: boolean;
  is_outlet_shop?: boolean;
  mart_shop_id?: number;
  outlet_shop_info_list?: ShopInfoOutletShop[];
}

export {
  ResponseCommon as ShopeeResponseCommon,
  ResponseGetAccessToken as ShopeeResponseGetAccessToken,
  ResponseRefreshAccessToken as ShopeeResponseRefreshAccessToken,
  ResponseShopProfile as ShopeeResponseShopProfile,
  ResponseShopInfo as ShopeeResponseShopInfo,
  ShopInfoSipAffiliateShop as ShopeeShopInfoSipAffiliateShop,
  ShopInfoLinkedDirectShop as ShopeeShopInfoLinkedDirectShop,
  ShopInfoOutletShop as ShopeeShopInfoOutletShop,
};
