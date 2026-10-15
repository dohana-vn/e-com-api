import { NhanhProductDepot } from './product.response';

export interface NhanhInventoryPrice {
  retail?: number;
  wholesale?: number;
  'import'?: number;
  avgCost?: number;
}

export interface NhanhInventoryWarranty {
  remain?: number;
  holding?: number;
}

export interface NhanhInventorySummary {
  remain?: number;
  shipping?: number;
  damaged?: number;
  holding?: number;
  transfering?: number;
  available?: number;
  warranty?: NhanhInventoryWarranty;
  depots?: NhanhProductDepot[];
}

export interface NhanhInventoryProduct {
  productId: number;
  barcode?: string;
  name?: string;
  prices?: NhanhInventoryPrice;
  inventory?: NhanhInventorySummary;
}

export interface NhanhInventoryListPaginatorResponse {
  next?: unknown;
}

export interface NhanhResponseInventoryListData {
  code: number;
  paginator?: NhanhInventoryListPaginatorResponse;
  data?: NhanhInventoryProduct[];
  messages?: string;
  errorCode?: string;
}
