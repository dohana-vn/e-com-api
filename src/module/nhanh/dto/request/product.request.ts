interface ProductSearchFilter {
  ids?: number[];
  name?: string;
  parentId?: number;
  gpid?: number;
  categoryIds?: number[];
  status?: number[];
  price?: { from?: number; to?: number };
  brandIds?: number[];
  imei?: string;
  updatedAtFrom?: number;
  updatedAtTo?: number;
}

interface ProductSearchPaginator {
  size?: number;
  sort?: Record<string, string>;
  next?: unknown;
}

interface ProductSearchRequest {
  filters?: ProductSearchFilter;
  paginator?: ProductSearchPaginator;
}

export {
  ProductSearchRequest as NhanhProductSearchRequest,
}
