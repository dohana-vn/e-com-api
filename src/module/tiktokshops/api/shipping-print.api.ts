import { TIKTOK_DOCUMENT_TYPE } from '../common/constant';
import { TiktokConfig } from '../dto/request/config.request';
import { TiktokShippingDocumentOptions } from '../dto/response/fulfillment.response';
import { getPackageShippingDocument } from './v2/fulfillment.api';

export interface FetchTiktokPrintOptions extends TiktokShippingDocumentOptions {
  documentType?: TIKTOK_DOCUMENT_TYPE;
}

export interface TiktokPrintResult {
  type: 'URL';
  source: 'TIKTOK';
  url: string;
  trackingNumber?: string;
  packageId: string;
  format: 'PDF' | 'PNG' | 'ZPL';
}

/**
 * Fetch shipping document URL for a TikTok Shop package.
 */
export async function fetchTiktokShippingDocumentUrl(
  packageId: string,
  config: TiktokConfig,
  options: FetchTiktokPrintOptions = {},
): Promise<TiktokPrintResult> {
  if (!packageId) {
    throw new Error('packageId is required to fetch TikTok shipping document');
  }

  const docType = options.documentType || TIKTOK_DOCUMENT_TYPE.SHIPPING_LABEL;
  const res = await getPackageShippingDocument(
    packageId,
    docType,
    config,
    options,
  );

  const docUrl = res?.data?.doc_url;
  if (!docUrl) {
    const errorMsg = res?.message || 'TikTok did not return a doc_url for this package';
    throw new Error(`Failed to get TikTok shipping document: ${errorMsg}`);
  }

  const format: 'PDF' | 'PNG' | 'ZPL' =
    options.document_format === 'ZPL'
      ? 'ZPL'
      : docType === TIKTOK_DOCUMENT_TYPE.SHIPPING_LABEL_PICTURE
      ? 'PNG'
      : 'PDF';

  return {
    type: 'URL',
    source: 'TIKTOK',
    url: docUrl,
    trackingNumber: res.data?.tracking_number,
    packageId,
    format,
  };
}

export const getShippingDocumentUrl = fetchTiktokShippingDocumentUrl;
