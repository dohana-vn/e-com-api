import axios from 'axios';
import { SHOPEE_END_POINT, SHOPEE_PATH } from '../common/constant';
import { ShopeeConfig } from '../dto/request/config.request';
import * as ShopeeHelper from '../common/helper';
import { buildOptionalParams } from '../common/helper'
import {
  ShopeeResponseGetReturnDetail,
  ShopeeResponseGetReturnList,
  ShopeeGetReturnListRequest,
} from '../dto';

// export async function getReturnList(
//   config: ShopeeConfig,
//   params: ShopeeGetReturnListRequest,
// ): Promise<ShopeeResponseGetReturnList> {
//   const timestamp = ShopeeHelper.getTimestampNow();

//   const signature = ShopeeHelper.signRequest(
//     SHOPEE_PATH.RETURN_LIST,
//     config,
//     timestamp,
//   );

//   const additionalParams = buildOptionalParams({
//     create_time_from: params.createTimeFrom,
//     create_time_to: params.createTimeTo,
//     update_time_from: params.updateTimeFrom,
//     update_time_to: params.updateTimeTo,
//     status: params.status,
//     negotiation_status: params.negotiationStatus,
//     seller_compensation_status: params.sellerCompensationStatus,
//     seller_proof_status: params.sellerProofStatus,
//     page_no: params.pageNo ?? 1,
//     page_size: params.pageSize ?? 10,
//   });

//   const commonParam = ShopeeHelper.buildCommonParams(
//     config,
//     signature,
//     timestamp,
//     additionalParams,
//   );

//   const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.RETURN_LIST}${commonParam}`;
  
//   try {
//     const { data } = await axios.get<ShopeeResponseGetReturnList>(url);
//     return data;
//   } catch (error: any) {
//     throw new Error(
//       `Failed to fetch return list: ${error?.response?.data?.message || error.message
//       }`,
//     );
//   }
// }
export async function getReturnList(
  config: ShopeeConfig,
  params: ShopeeGetReturnListRequest,
): Promise<ShopeeResponseGetReturnList> {
  const timestamp = ShopeeHelper.getTimestampNow();

  const signature = ShopeeHelper.signRequest(
    SHOPEE_PATH.RETURN_LIST,
    config,
    timestamp,
  );

  const additionalParams = ShopeeHelper.buildOptionalParams({
    create_time_from: params.createTimeFrom,
    create_time_to: params.createTimeTo,
    update_time_from: params.updateTimeFrom,
    update_time_to: params.updateTimeTo,
    status: params.status,
    negotiation_status: params.negotiationStatus,
    seller_compensation_status: params.sellerCompensationStatus,
    seller_proof_status: params.sellerProofStatus,
    page_no: params.pageNo ?? 1,
    page_size: params.pageSize ?? 10,
  });

  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
    additionalParams,
  );

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.RETURN_LIST}${commonParam}`;

  return ShopeeHelper.httpGet(url, config);
}

// export async function getReturnDetail(
//   config: ShopeeConfig,
//   returnSn: string,
// ): Promise<ShopeeResponseGetReturnDetail> {
//   const timestamp = ShopeeHelper.getTimestampNow();

//   const signature = ShopeeHelper.signRequest(
//     SHOPEE_PATH.RETURN_DETAIL,
//     config,
//     timestamp,
//   );

//   const additionalParams = {
//     return_sn: returnSn,
//   };

//   const commonParam = ShopeeHelper.buildCommonParams(
//     config,
//     signature,
//     timestamp,
//     additionalParams,
//   );

//   const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.RETURN_DETAIL}${commonParam}`;

//   try {
//     const { data } = await axios.get<ShopeeResponseGetReturnDetail>(url);
//     return data;
//   } catch (error: any) {
//     throw new Error(
//       `Failed to fetch return detail: ${error?.response?.data?.message || error.message
//       }`,
//     );
//   }
// }
export async function getReturnDetail(
  config: ShopeeConfig,
  returnSn: string,
): Promise<ShopeeResponseGetReturnDetail> {
  const timestamp = ShopeeHelper.getTimestampNow();

  const signature = ShopeeHelper.signRequest(
    SHOPEE_PATH.RETURN_DETAIL,
    config,
    timestamp,
  );

  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
    { return_sn: returnSn },
  );

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.RETURN_DETAIL}${commonParam}`;

  return ShopeeHelper.httpGet(url, config);
}


