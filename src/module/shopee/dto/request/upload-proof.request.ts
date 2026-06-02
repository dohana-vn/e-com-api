export interface ShopeeUploadReturnProofPhoto {
  url: string;
  thumbnail: string;
}

export interface ShopeeUploadReturnProofRequest {
  returnSn: string;
  photo?: ShopeeUploadReturnProofPhoto[];
  description?: string;
}