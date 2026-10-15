import { NhanhConfig, NhanhDepotListRequest, NhanhResponseDepotListData } from '../dto';
import * as NhanHelper from '../common/helper';
import { NHANH_PATH, NHANH_V3_END_POINT } from '../common/constant';

export async function getDepotList(
  params: NhanhDepotListRequest,
  config: NhanhConfig,
): Promise<NhanhResponseDepotListData> {
  const queryParams = new URLSearchParams({
    appId: config.appId,
    businessId: config.businessId ?? '',
  });
  const url = `${NHANH_V3_END_POINT}${NHANH_PATH.DEPOT_LIST}?${queryParams}`;
  const headers = NhanHelper.getHeaders(config);
  return NhanHelper.httpPost(url, params, headers);
}
