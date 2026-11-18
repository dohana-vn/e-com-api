import { NhanhOrderData } from '../../nhanh';

export type PlatformType = 'SHOPEE' | 'TIKTOK' | 'NHANH' | 'OTHER';

export interface IdentifiedOrder {
  nhanhOrderId: number;
  platform: PlatformType;
  platformOrderId: string;
  platformPackageId?: string;
  channelName: string;
  carrierCode?: string;
  rawNhanhOrder?: NhanhOrderData;
}

export interface BridgeOrderItem {
  itemName?: string;
  modelName?: string;
  skuName?: string;
  quantity?: number;
  price?: number;
}

export interface BridgeOrderDetailResult {
  source: PlatformType;
  channelName: string;
  nhanhOrderId: number;
  platformOrderId: string;
  orderStatus?: string;
  totalAmount?: number | string;
  shippingCarrier?: string;
  recipientAddress?: string;
  items: BridgeOrderItem[];
  rawResponse?: any;
}
