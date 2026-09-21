import { ShopeeResponseCommon } from './config.response';

export interface ShopeeConvertReturnImageData {
  url: string;
  thumbnail: string;
}

export interface ShopeeResponseConvertReturnImage extends ShopeeResponseCommon<ShopeeConvertReturnImageData> {}