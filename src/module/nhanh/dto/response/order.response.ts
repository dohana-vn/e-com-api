export interface NhanhOrderInfo {
  id: number;
  depotId?: number;
  pickupDepotId?: number;
  type?: number;
  mope?: number;
  exportType?: number;
  originalOrderId?: number;
  returnFromId?: number;
  idReturn?: number;
  createdByName?: string;
  createdById?: number;
  saleName?: string;
  saleId?: number;
  packedByName?: string;
  packedById?: string;
  customerCareId?: number;
  customerCareName?: string;
  createdAt?: number;
  updatedAt?: number;
  confirmedAt?: number;
  packedAt?: number;
  description?: string;
  privateDescription?: string;
  orderIndex?: number;
  status?: number;
  reason?: number;
  handoverIds?: number[];
  tags?: unknown[];
  trackingUrl?: string;
}

export interface NhanhOrderChannel {
  appOrderId?: string;
  saleChannel?: number;
  trafficSource?: string;
  pageId?: string;
  conversationId?: string;
  fbAdsId?: number;
  fbPsid?: number;
  domain?: string;
  shopName?: string;
  shopId?: string;
  affiliate?: unknown;
  marketting?: unknown;
}

export interface NhanhOrderShippingAddress {
  id?: number;
  code?: string;
  name?: string;
  mobile?: string;
  email?: string;
  address?: string;
  birthday?: string;
  cityId?: number;
  districtId?: number;
  wardId?: number;
  location?: string;
  companyName?: string;
  companyAddress?: string;
  taxCode?: string;
}

export interface NhanhOrderProduct {
  id?: number;
  typeId?: number;
  code?: string;
  name?: string;
  appProductId?: string;
  weight?: number;
  quantity?: number;
  originalQuantity?: number;
  price?: number;
  discount?: number;
  avgCost?: number;
  vat?: number;
  description?: string;
  imeiId?: number;
  imei?: string;
  imeiIds?: number[];
  imeiCodes?: { id: number; code: string }[];
  priceListName?: string;
  transactionFee?: number;
  paymentStatus?: number;
  partialReturnStatus?: number;
  usedPoints?: number;
  usedPointAmount?: number;
  batch?: unknown;
  unit?: unknown;
  gifts?: unknown[];
  combos?: unknown[];
}

export interface NhanhOrderCarrier {
  id?: number;
  name?: string;
  service?: {
    id?: number;
    name?: string;
    code?: string;
    type?: number;
  };
  carrierCode?: string;
  fullCarrierCode?: string;
  carrierSortCode?: string;
  packageCode?: string;
  checkGoods?: string;
  sendCarrierType?: number;
  sendCarrierAt?: string;
  deliveryAt?: string;
  isPartDelivery?: number;
  isDeclaredFee?: number;
  declaredValue?: number;
  declaredFee?: number;
  carrierPromotionCode?: string;
  weight?: number;
  shipFee?: number;
  codFee?: number;
  overWeightShipFee?: number;
  returnFee?: number;
  customerShipFee?: number;
  ecomFee?: number;
  carrierPaymentStatus?: number;
}

export interface NhanhOrderPayment {
  usedPoints?: unknown;
  vat?: unknown;
  discount?: unknown;
  couponCode?: string;
  debtDueDate?: string;
  deposit?: unknown;
  transfer?: unknown;
  credit?: unknown;
  codAmount?: number;
  businessPayment?: number;
  businessPaymentStatus?: number;
}

export interface NhanhOrderData {
  info?: NhanhOrderInfo;
  channel?: NhanhOrderChannel;
  shippingAddress?: NhanhOrderShippingAddress;
  products?: NhanhOrderProduct[];
  carrier?: NhanhOrderCarrier;
  payment?: NhanhOrderPayment;
  originalOrder?: {
    id?: number;
    channel?: {
      appOrderId?: string;
      appShopId?: string;
      saleChannel?: number;
    };
  };
}

export interface NhanhOrderListPaginatorResponse {
  next?: unknown;
}

export interface NhanhResponseOrderList {
  code: number;
  paginator?: NhanhOrderListPaginatorResponse;
  data?: NhanhOrderData[];
  messages?: string;
  errorCode?: string;
}
