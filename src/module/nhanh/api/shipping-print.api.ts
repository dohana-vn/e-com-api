import { NhanhConfig } from '../dto';

export interface NhanhPrintResult {
  source: 'NHANH';
  type: 'RAW_DATA';
  orderData?: any;
  message: string;
}

/**
 * Nhanh.vn does not have an Open API endpoint to render shipping document PDFs.
 * This function packages order data as RAW_DATA for backend HTML/PDFkit A6 thermal printing.
 */
export async function fetchNhanhShippingDocument(
  orderData: any,
  _config?: NhanhConfig,
): Promise<NhanhPrintResult> {
  return {
    source: 'NHANH',
    type: 'RAW_DATA',
    orderData,
    message:
      'Nhanh.vn Open API does not provide a direct print document endpoint. Render A6/A5 shipping label on backend with pdfkit + bwip-js using order data.',
  };
}

export const getShippingDocument = fetchNhanhShippingDocument;
