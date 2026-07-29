import { NhanhConfig, NhanhResponseProductSearchData } from '../dto';
import * as NhanHelper from '../common/helper'
import { NHANH_PATH, NHANH_V3_END_POINT } from '../common/constant';
import { NhanhProductSearchRequest } from '../dto';

export async function getListProduct(params: NhanhProductSearchRequest, config: NhanhConfig): Promise<NhanhResponseProductSearchData> {
  const commonParam = NhanHelper.commonParameter(config, params);
  const headers = NhanHelper.getHeaders(config);
  const url = `${NHANH_V3_END_POINT}${NHANH_PATH.PRODUCT_LIST}`;
  return NhanHelper.httpPost(url, commonParam, headers);
}