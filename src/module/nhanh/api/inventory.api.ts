import { NhanhConfig, NhanhInventorySearchRequest, NhanhResponseInventoryListData } from '../dto';
import * as NhanHelper from '../common/helper';
import { NHANH_PATH, NHANH_V3_END_POINT } from '../common/constant';

export async function getInventoryList(
  params: NhanhInventorySearchRequest,
  config: NhanhConfig,
): Promise<NhanhResponseInventoryListData> {
  const queryParams = new URLSearchParams({
    appId: config.appId,
    businessId: config.businessId ?? '',
  });
  const url = `${NHANH_V3_END_POINT}${NHANH_PATH.PRODUCT_INVENTORY}?${queryParams}`;
  const headers = NhanHelper.getHeaders(config);
  return NhanHelper.httpPost(url, params, headers);
}
