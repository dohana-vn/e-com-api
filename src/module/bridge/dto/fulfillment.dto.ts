import { PlatformType } from './order.dto';

export interface BridgeShipOrderResult {
  success: boolean;
  platform: PlatformType;
  nhanhOrderId: number;
  platformOrderId: string;
  message: string;
  data?: any;
}

export interface BridgeShippingLabelResult {
  platform: PlatformType;
  nhanhOrderId: number;
  platformOrderId: string;
  printStatus: 'READY' | 'FAILED' | 'RAW_DATA';
  documentUrl?: string | null;
  fileType?: string;
  message?: string;
}

export interface BridgeTrackingResult {
  platform: PlatformType;
  nhanhOrderId: number;
  platformOrderId: string;
  trackingNumber: string;
  carrierName?: string;
  status?: string;
}
