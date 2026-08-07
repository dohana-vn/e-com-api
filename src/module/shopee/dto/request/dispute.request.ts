export interface ShopeeDisputeReturnImageItem {
  module_index: number;
  requirement: string;
  image_url: string[];
}

export interface ShopeeDisputeReturnRequest {
  returnSn: string;
  email: string;
  disputeReasonId: number;
  imageList?: ShopeeDisputeReturnImageItem[];
  disputeTextReason?: string;
}