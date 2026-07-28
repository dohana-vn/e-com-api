import { NhanhConfig, NhanhOrderListRequest, NhanhResponseOrderList } from '../dto';
import * as NhanHelper from '../common/helper';
import { NHANH_PATH, NHANH_V3_END_POINT } from '../common/constant';

export async function getOrderList(
  params: NhanhOrderListRequest,
  config: NhanhConfig,
): Promise<NhanhResponseOrderList> {
  const commonParam = NhanHelper.commonParameter(config, params);
  const headers = NhanHelper.getHeaders(config);
  const url = `${NHANH_V3_END_POINT}${NHANH_PATH.ORDER_LIST}`;
  return NhanHelper.httpPost(url, commonParam, headers);
}
