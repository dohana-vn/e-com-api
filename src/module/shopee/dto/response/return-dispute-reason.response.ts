import { ShopeeResponseCommon } from './config.response';

export interface ShopeeReturnDisputeSampleEvidence {
  type: number;
  url: string;
  thumbnail?: string;
}

export interface ShopeeReturnDisputeEvidenceModule {
  module_index: number;
  requirement: string;
  is_required: boolean;
}

export interface ShopeeReturnDisputeReasonItem {
  dispute_reason: string;
  dispute_requirement: string;
  sample_evidence: ShopeeReturnDisputeSampleEvidence[];
  evidence_module_list: ShopeeReturnDisputeEvidenceModule[];
}

export interface ShopeeReturnDisputeReasonData {
  dispute_reason_list: ShopeeReturnDisputeReasonItem[];
}

export interface ShopeeResponseGetReturnDisputeReason
  extends ShopeeResponseCommon<ShopeeReturnDisputeReasonData> { }