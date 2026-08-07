import { ShopeeResponseCommon } from './config.response';

export interface ShopeeDisputeReturnData {
  return_sn: string;
  msg: string;
}

export interface ShopeeResponseDisputeReturn
  extends ShopeeResponseCommon<ShopeeDisputeReturnData> {}