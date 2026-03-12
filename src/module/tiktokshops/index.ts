import { searchReturns } from './api/v2/return-refund.api';

export * from './api/v2/authorization.api'
export * from './dto/response'
import { getOrderDetail, getOrderList } from './api/v2/order.api';
import { TiktokConfig } from './dto/request/config.request';
import { fetchTokenWithTiktokAuthCode, getAuthorizedShop, refreshToken } from './api/v2/authorization.api';
import { createProduct, getAttributes, getBrands, getCategories, getListProduct, getProductDetail } from './api/v2/product.api';
import {detailPackage, getPackageShippingDocument, getPackageTimeSlots, searchPackage, shipPackage} from './api/v2/fulfillment.api';
import { TiktokRequestSearchPackage, TiktokRequestShipPackage } from './dto/request/fulfillment.request';
import { TIKTOK_DOCUMENT_TYPE } from './common/constant';
import { TiktokResponseAttributes, TiktokResponseBrands, TiktokResponseCategories } from './dto/response/product.response';
import { TiktokResponseAccessToken, TiktokResponseAuthorized, TiktokResponseRefreshToken } from './dto/response/config.response';
import { TiktokResponsePackageTimeSlot } from './dto/response/fulfillment.response';
import { TiktokResponseOrderDetail } from './dto/response/order.response';
import { TiktokRequestCreateProduct } from './dto/request/product.request';
import { ResponseReturnOrdersDataDto, ReturnOrdersDataDto } from './dto/response';

export class TiktokModule {
  private config: TiktokConfig;
  constructor(config: TiktokConfig) {
    this.config = config;
  }

  setConfig(config: TiktokConfig) {
    this.config.accessToken = config.accessToken;
    this.config.refreshToken = config.refreshToken;
    this.config.accessTokenExpire = config.accessTokenExpire;
    this.config.refreshTokenExipre = config.refreshTokenExipre;
  }

  getConfig(): TiktokConfig {
    return this.config;
  }

  async getOrderList(from: number, params: {page_size: number;page_token?: string}): Promise<any> {
    return await getOrderList(from, params, this.config);
  }

  async getOrderDetail(orderNumber: string): Promise<TiktokResponseOrderDetail> {
    return await getOrderDetail(orderNumber, this.config);
  }

  async getProductDetail(productId: string): Promise<any> {
    return await getProductDetail(productId, this.config);
  }

  async getListProduct({params}: {params: {page_size: number;page_token?: string}}, body?: any): Promise<any> {
    return await getListProduct(params, this.config, body);
  }

  async getAuthorizedShop(): Promise<TiktokResponseAuthorized> {
    return await getAuthorizedShop(this.config);
  }

  async getPackageDetail(packageId: string): Promise<TiktokResponsePackageTimeSlot> {
    return await detailPackage(packageId, this.config);
  }

  async getPackageTimeSlots(packageId: string): Promise<TiktokResponsePackageTimeSlot> {
    return await getPackageTimeSlots(packageId, this.config);
  }

  async shipPackage(packageId: string, payload: TiktokRequestShipPackage) {
    return await shipPackage(packageId, payload, this.config);
  }

  async getShippingDocument(packageId: string, documentType: TIKTOK_DOCUMENT_TYPE): Promise<any> {
    return await getPackageShippingDocument(packageId, documentType, this.config);
  }

  async getCategories(): Promise<TiktokResponseCategories> {
    return await getCategories(this.config);
  }

  async getBrands(categoryId: string): Promise<TiktokResponseBrands> {
    return await getBrands(categoryId, this.config);
  }

  async getAttributes(categoryId: string): Promise<TiktokResponseAttributes> {
    return await getAttributes(categoryId, this.config);
  }

  async createProduct(payload: TiktokRequestCreateProduct) {
    return await createProduct(payload, this.config);
  }

  async refreshToken(): Promise<TiktokResponseRefreshToken> {
    return await refreshToken(this.config);
  }

  async fetchTokenWithAuthCode(authCode: string): Promise<TiktokResponseAccessToken> {
    return await fetchTokenWithTiktokAuthCode(authCode, this.config);
  }

  async searchReturnRefund(returnIds: string[], from: number, params: {page_size: number;page_token?: string}): Promise<ResponseReturnOrdersDataDto> {
    return await searchReturns(returnIds, from, params, this.config);
  }

  async searchPackage(payload: TiktokRequestSearchPackage, params: { page_size: number; page_token?: string; sort_field?: string; sort_order?: string }): Promise<any> {
    return await searchPackage(payload, params, this.config);
  } 
}
