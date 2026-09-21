import { TiktokConfig } from '../../dto/request/config.request';
import { TIKTOK_PATH_202309 } from '../../common/constant';
import * as TiktokHelper from '../../common/helper';
import { ResponseReturnOrdersDataDto } from '../../dto/response';

/**
 *
 * @param orderNumber The order number.
 * @param config Tiktok API configuration.
 * @returns The response containing the order detail.
 */
export async function searchReturns(returnIds: string[], before: number, params: {page_size: number;page_token?: string}, config: TiktokConfig): Promise<ResponseReturnOrdersDataDto> {
  const timestamp = Math.floor(Date.now() / 1000);
  const commonParam = TiktokHelper.commonParameter3(config, {page_size: params.page_size, page_token: params.page_token, version: '202309'}, timestamp);

  const body = {
    return_ids: returnIds,
    update_time_ge: before,
  };

  const url = TiktokHelper.genURLWithSignatureV2(TIKTOK_PATH_202309.SEARCH_RETURN, commonParam, config, body);

  const headers = TiktokHelper.getHeaders(config);

  return TiktokHelper.httpPost(url, body, headers);
}

/**
 * List returns updated within an update_time window (no return_ids).
 * Used by reconciliation/cron flows to catch missed webhooks.
 */
export async function searchReturnsByUpdateTime(updateTimeGe: number, updateTimeLt: number, params: {page_size: number;page_token?: string}, config: TiktokConfig): Promise<ResponseReturnOrdersDataDto> {
  const timestamp = Math.floor(Date.now() / 1000);
  const commonParam = TiktokHelper.commonParameter3(config, {page_size: params.page_size, page_token: params.page_token, version: '202309'}, timestamp);

  const body = {
    update_time_ge: updateTimeGe,
    update_time_lt: updateTimeLt,
  };

  const url = TiktokHelper.genURLWithSignatureV2(TIKTOK_PATH_202309.SEARCH_RETURN, commonParam, config, body);

  const headers = TiktokHelper.getHeaders(config);

  return TiktokHelper.httpPost(url, body, headers);
}
