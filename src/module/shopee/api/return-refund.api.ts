import { SHOPEE_END_POINT, SHOPEE_PATH } from '../common/constant';
import { ShopeeConfig } from '../dto/request/config.request';
import * as ShopeeHelper from '../common/helper';
import {
  ShopeeConvertReturnImageRequest,
  ShopeeUploadReturnProofRequest,
  ShopeeResponseGetAvailableSolutions,
  ShopeeResponseGetReturnDetail,
  ShopeeResponseGetReturnDisputeReason,
  ShopeeResponseGetReturnList,
  ShopeeResponseQueryReturnProof,
  ShopeeResponseConvertReturnImage,
  ShopeeResponseUploadReturnProof,
  ShopeeGetReturnListRequest,
} from '../dto';

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

export async function getReturnDisputeReason(
  config: ShopeeConfig,
  returnSn: string,
): Promise<ShopeeResponseGetReturnDisputeReason> {
  const timestamp = ShopeeHelper.getTimestampNow();

  const signature = ShopeeHelper.signRequest(
    SHOPEE_PATH.RETURN_DISPUTE_REASON,
    config,
    timestamp,
  );

  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
    { return_sn: returnSn },
  );

  const url =
    `${SHOPEE_END_POINT}${SHOPEE_PATH.RETURN_DISPUTE_REASON}${commonParam}`;

  return ShopeeHelper.httpGet(url, config);
}

export async function getAvailableSolutions(
  config: ShopeeConfig,
  returnSn: string,
): Promise<ShopeeResponseGetAvailableSolutions> {
  const timestamp = ShopeeHelper.getTimestampNow();

  const signature = ShopeeHelper.signRequest(
    SHOPEE_PATH.RETURN_SOLUTION,
    config,
    timestamp,
  );

  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
    { return_sn: returnSn },
  );

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.RETURN_SOLUTION}${commonParam}`;

  return ShopeeHelper.httpGet(url, config);
}

export async function queryReturnProof(
  config: ShopeeConfig,
  returnSn: string,
): Promise<ShopeeResponseQueryReturnProof> {
  const timestamp = ShopeeHelper.getTimestampNow();

  const signature = ShopeeHelper.signRequest(
    SHOPEE_PATH.RETURN_QUERY_PROOF,
    config,
    timestamp,
  );

  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
    { return_sn: returnSn },
  );

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.RETURN_QUERY_PROOF}${commonParam}`;

  return ShopeeHelper.httpGet(url, config);
}

export async function convertReturnImage(
  config: ShopeeConfig,
  params: ShopeeConvertReturnImageRequest,
): Promise<ShopeeResponseConvertReturnImage> {
  const timestamp = ShopeeHelper.getTimestampNow();

  const signature = ShopeeHelper.signRequest(
    SHOPEE_PATH.RETURN_CONVERT_IMAGE,
    config,
    timestamp,
  );

  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
  );

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.RETURN_CONVERT_IMAGE}${commonParam}`;

  const formData = await ShopeeHelper.buildImageUploadFormData(
    params.returnSn,
    params.uploadImagePath,
  );

  return ShopeeHelper.httpPostMultipart(url, formData);
}

export async function uploadReturnProof(
  config: ShopeeConfig,
  params: ShopeeUploadReturnProofRequest,
): Promise<ShopeeResponseUploadReturnProof> {
  const timestamp = ShopeeHelper.getTimestampNow();

  const signature = ShopeeHelper.signRequest(
    SHOPEE_PATH.RETURN_UPLOAD_PROOF,
    config,
    timestamp,
  );

  const commonParam = ShopeeHelper.buildCommonParams(
    config,
    signature,
    timestamp,
  );

  const body = {
    return_sn: params.returnSn,
    photo: params.photo,
    description: params.description,
  };

  const url = `${SHOPEE_END_POINT}${SHOPEE_PATH.RETURN_UPLOAD_PROOF}${commonParam}`;

  return ShopeeHelper.httpPost(url, body, config);
}


