import { ShopeeResponseCommon } from './config.response';

export interface ShopeeReturnProofAsset {
  url: string;
  thumbnail: string;
}

export interface ShopeeReturnProofData {
  image: ShopeeReturnProofAsset[];
  video: ShopeeReturnProofAsset[];
  description?: string;
}

export interface ShopeeResponseQueryReturnProof
  extends ShopeeResponseCommon<ShopeeReturnProofData> { }