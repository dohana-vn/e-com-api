import { NhanhConfig, NhanhResponseProductSearchData } from '../dto';
import * as NhanHelper from '../common/helper'
import { NHANH_PATH, NHANH_V3_END_POINT } from '../common/constant';
import { NhanhProductSearchRequest } from '../dto';

export async function getListProduct(params: NhanhProductSearchRequest, config: NhanhConfig): Promise<NhanhResponseProductSearchData> {
  const queryParams = new URLSearchParams({
    appId: config.appId,
    businessId: config.businessId ?? '',
  });
  const url = `${NHANH_V3_END_POINT}${NHANH_PATH.PRODUCT_LIST}?${queryParams}`;
  const headers = NhanHelper.getHeaders(config);
  return NhanHelper.httpPost(url, params, headers);
}