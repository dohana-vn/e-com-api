import { TiktokResponseCommon } from './config.response';

interface PickupSlot {
  available: boolean;
  end_time: boolean;
  start_time: boolean;
}

interface PackageTimeSlot {
  can_drop_off: boolean;
  can_pickup: boolean;
  drop_off_point_url: string;
  pickup_slots: Array<PickupSlot>;
}

/** TikTok Shop package lifecycle status. */
export type TiktokPackageStatus =
  | 'TO_FULFILL'
  | 'PROCESSING'
  | 'FULFILLING'
  | 'COMPLETED'
  | 'CANCELLED';

interface PackageDetail {
  package_id?: string;
  package_status?: TiktokPackageStatus;
  package_sub_status?: string;
  tracking_number?: string;
  [key: string]: unknown;
}

interface PackageShippingDocument {
  /** Shipping document URL. Valid for 24 hours. */
  doc_url?: string;
  tracking_number?: string;
}

interface ShippingDocumentOptions {
  /** A6 (default) or A5. Ignored for SHIPPING_LABEL_PICTURE. */
  document_size?: 'A6' | 'A5';
  /** PDF (default) or ZPL (Brazil only). */
  document_format?: 'PDF' | 'ZPL';
  shipping_period?: string;
}

type ResponsePackageTimeSlot = TiktokResponseCommon<PackageTimeSlot>;
type ResponsePackageDetail = TiktokResponseCommon<PackageDetail>;
type ResponsePackageShippingDocument =
  TiktokResponseCommon<PackageShippingDocument>;

export {
  ResponsePackageTimeSlot as TiktokResponsePackageTimeSlot,
  ResponsePackageDetail as TiktokResponsePackageDetail,
  ResponsePackageShippingDocument as TiktokResponsePackageShippingDocument,
  PackageDetail as TiktokPackageDetail,
  PackageShippingDocument as TiktokPackageShippingDocument,
  ShippingDocumentOptions as TiktokShippingDocumentOptions,
};
