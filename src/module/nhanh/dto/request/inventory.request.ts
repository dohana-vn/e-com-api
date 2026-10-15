interface InventorySearchFilter {
  ids?: number[];
  name?: string;
  depotIds?: number[];
  categoryId?: number;
  status?: number[];
  brandIds?: number[];
  updatedAtFrom?: number;
  updatedAtTo?: number;
}

interface InventorySearchPaginator {
  size?: number;
  sort?: Record<string, string>;
  next?: unknown;
}

interface InventorySearchRequest {
  filters?: InventorySearchFilter;
  paginator?: InventorySearchPaginator;
}

export { InventorySearchRequest as NhanhInventorySearchRequest };
