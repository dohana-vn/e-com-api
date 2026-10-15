export interface NhanhDepotLocation {
  cityId?: number;
  cityName?: string;
  districtId?: number;
  districtName?: string;
  wardId?: number;
  wardName?: string;
  address?: string;
}

export interface NhanhDepotLocationV2 {
  cityId?: number;
  cityName?: string;
  wardId?: number;
  wardName?: string;
  address?: string;
}

export interface NhanhDepot {
  id: number;
  code?: string;
  name?: string;
  mobile?: string;
  location?: NhanhDepotLocation;
  locationV2?: NhanhDepotLocationV2;
}

export interface NhanhDepotListPaginatorResponse {
  next?: unknown;
}

export interface NhanhResponseDepotListData {
  code: number;
  paginator?: NhanhDepotListPaginatorResponse;
  data?: NhanhDepot[];
  messages?: string;
  errorCode?: string;
}
