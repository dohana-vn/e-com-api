import { NhanhConfig, NhanhOrderListRequest, NhanhResponseOrderList } from '../dto';
import * as NhanHelper from '../common/helper';
import { NHANH_PATH, NHANH_V3_END_POINT } from '../common/constant';

export async function getOrderList(
  params: NhanhOrderListRequest,
  config: NhanhConfig,
): Promise<NhanhResponseOrderList> {
  const queryParams = new URLSearchParams({
    appId: config.appId,
    businessId: config.businessId ?? '',
  });
  const url = `${NHANH_V3_END_POINT}${NHANH_PATH.ORDER_LIST}?${queryParams}`;
  const headers = NhanHelper.getHeaders(config);
  return NhanHelper.httpPost(url, params, headers);
}
