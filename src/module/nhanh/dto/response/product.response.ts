export interface NhanhProductPrice {
  retail?: number;
  retailVat?: number;
  import_?: number;
  importVat?: number;
  old?: number;
  wholesale?: number;
  avgCost?: number;
}

export interface NhanhProductImage {
  avatar?: string;
  others?: string[];
}

export interface NhanhProductShipping {
  width?: number;
  height?: number;
  length?: number;
  weight?: number;
}

export interface NhanhProductDepot {
  id?: number;
  remain?: number;
  shipping?: number;
  damaged?: number;
  holding?: number;
  transfering?: number;
  available?: number;
  warranty?: {
    remain?: number;
    holding?: number;
  };
}

export interface NhanhProductInventory {
  remain?: number;
  shipping?: number;
  damaged?: number;
  holding?: number;
  transfering?: number;
  available?: number;
  warranty?: {
    remain?: number;
    holding?: number;
  };
  depots?: NhanhProductDepot[];
}

export interface NhanhProductAttribute {
  id?: number;
  name?: string;
  nameOther?: string;
  value?: string;
  code?: string;
  codeOther?: string;
}

export interface NhanhProduct {
  id: number;
  parentId?: number;
  code?: string;
  barcode?: string;
  name?: string;
  otherName?: string;
  status?: number;
  priceVatMode?: number;
  importPriceVatMode?: number;
  categoryId?: number;
  internalCategoryId?: number;
  prices?: NhanhProductPrice;
  images?: NhanhProductImage;
  brandId?: number;
  type?: number;
  shipping?: NhanhProductShipping;
  countryName?: string;
  inventory?: NhanhProductInventory;
  attributes?: NhanhProductAttribute[];
  updatedAt?: number;
  createdAt?: number;
}

export interface NhanhProductSearchPaginatorResponse {
  next?: unknown;
}

export interface NhanhResponseProductSearchData {
  code: number;
  paginator?: NhanhProductSearchPaginatorResponse;
  data?: NhanhProduct[];
  messages?: string;
  errorCode?: string;
}
