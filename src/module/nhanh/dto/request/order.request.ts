export interface NhanhOrderListFilters {
  createdAtFrom?: number;
  createdAtTo?: number;
  deliveryAtFrom?: number;
  deliveryAtTo?: number;
  updatedAtFrom?: number;
  updatedAtTo?: number;
  ids?: number[];
  statuses?: number[];
  saleChannels?: number[];
  depotIds?: number[];
  type?: number;
  handoverId?: number;
  carrier?: {
    id?: number;
    code?: string;
  };
  shippingAddress?: {
    id?: number;
    mobile?: string;
    cityId?: number;
    districtId?: number;
    wardId?: number;
  };
}

export interface NhanhOrderListPaginator {
  size?: number;
  next?: unknown;
}

export interface NhanhOrderListRequest {
  filters?: NhanhOrderListFilters;
  paginator?: NhanhOrderListPaginator;
  dataOptions?: {
    marketing?: number;
    comboItems?: number;
  };
}
