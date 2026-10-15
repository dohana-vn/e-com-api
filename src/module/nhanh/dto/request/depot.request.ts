interface DepotListFilter {
  ids?: number[];
}

interface DepotListRequest {
  filters?: DepotListFilter;
}

export { DepotListRequest as NhanhDepotListRequest };
