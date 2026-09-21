import { ShopeeResponseCommon } from './config.response';

export interface ShopeeReturnAvailableSolutionOffer {
  eligibility: boolean;
  refund_amount_adjustable: boolean;
  max_refund_amount?: number;
  min_refund_amount?: number;
}

export interface ShopeeReturnAvailableSolutionsData {
  return_sn: string;
  offer_return_refund?: ShopeeReturnAvailableSolutionOffer;
  offer_refund?: ShopeeReturnAvailableSolutionOffer;
}

export interface ShopeeResponseGetAvailableSolutions
  extends ShopeeResponseCommon<ShopeeReturnAvailableSolutionsData> {}