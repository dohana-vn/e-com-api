export class ShopeeGetReturnListRequest {
  createTimeFrom?: number;
  createTimeTo?: number;

  updateTimeFrom?: number;
  updateTimeTo?: number;

  status?: string;
  negotiationStatus?: string;
  sellerCompensationStatus?: string;
  sellerProofStatus?: string;

  pageNo?: number;
  pageSize?: number;
}


