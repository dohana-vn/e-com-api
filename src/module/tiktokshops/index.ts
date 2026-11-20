import { searchReturns, searchReturnsByUpdateTime } from './api/v2/return-refund.api';
import {
  getOrderStatementTransactions,
  getPayments,
  getStatements,
  getStatementTransactions,
  getUnsettledTransactions,
  getWithdrawals,
} from './api/v2/finance.api';
import {
  TiktokGetOrderStatementTransactionsParams,
  TiktokGetPaymentsParams,
  TiktokGetStatementsParams,
  TiktokGetStatementTransactionsParams,
  TiktokGetUnsettledTransactionsParams,
  TiktokGetWithdrawalsParams,
} from './dto/request/finance.request';
import {
  TiktokFinanceResponse,
  TiktokPaymentListData,
  TiktokStatementListData,
  TiktokStatementTransactionListData,
  TiktokUnsettledTransactionListData,
  TiktokWithdrawalListData,
} from './dto/response/finance.response';

export * from './api/v2/authorization.api'
export * from './dto/response'
export * from './common/shipping-print.helper'
export * from './api/shipping-print.api'
export * from './api/v2/fulfillment.api'
export { TIKTOK_DOCUMENT_TYPE, TIKTOK_ORDER_STATUS } from './common/constant'
export * from './dto/response/fulfillment.response'
import { getOrderDetail, getOrderList, getOrderListByRange, getOrdersByCreateTimeRange } from './api/v2/order.api';
import { TiktokConfig } from './dto/request/config.request';
import { fetchTokenWithTiktokAuthCode, getAuthorizedShop, refreshToken } from './api/v2/authorization.api';
import { createProduct, getAttributes, getBrands, getCategories, getListProduct, getProductDetail } from './api/v2/product.api';
import {
  detailPackage,
  getPackageShippingDocument,
  getPackageTimeSlots,
  searchPackage,
  shipPackage,
} from './api/v2/fulfillment.api';
import {
  fetchTiktokShippingDocumentUrl,
  FetchTiktokPrintOptions,
  TiktokPrintResult,
} from './api/shipping-print.api';
import {
  isTiktokOrderPrintable,
  TiktokPrintEligibilityCandidate,
  TiktokPrintEligibilityResult,
} from './common/shipping-print.helper';
import { TiktokRequestSearchPackage, TiktokRequestShipPackage } from './dto/request/fulfillment.request';
import { TIKTOK_DOCUMENT_TYPE } from './common/constant';
import { TiktokResponseAttributes, TiktokResponseBrands, TiktokResponseCategories } from './dto/response/product.response';
import { TiktokResponseAccessToken, TiktokResponseAuthorized, TiktokResponseRefreshToken } from './dto/response/config.response';
import {
  TiktokResponsePackageDetail,
  TiktokResponsePackageShippingDocument,
  TiktokResponsePackageTimeSlot,
  TiktokShippingDocumentOptions,
} from './dto/response/fulfillment.response';
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

  async getOrderListByRange(from: number, to: number, params: {page_size: number;page_token?: string}): Promise<any> {
    return await getOrderListByRange(from, to, params, this.config);
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

  async getPackageDetail(packageId: string): Promise<TiktokResponsePackageDetail> {
    return await detailPackage(packageId, this.config);
  }

  async getPackageTimeSlots(packageId: string): Promise<TiktokResponsePackageTimeSlot> {
    return await getPackageTimeSlots(packageId, this.config);
  }

  async shipPackage(packageId: string, payload: TiktokRequestShipPackage) {
    return await shipPackage(packageId, payload, this.config);
  }

  async getShippingDocument(
    packageId: string,
    documentType: TIKTOK_DOCUMENT_TYPE,
    options?: TiktokShippingDocumentOptions,
  ): Promise<TiktokResponsePackageShippingDocument> {
    return await getPackageShippingDocument(packageId, documentType, this.config, options);
  }

  async getShippingDocumentUrl(
    packageId: string,
    options?: FetchTiktokPrintOptions,
  ): Promise<TiktokPrintResult> {
    return await fetchTiktokShippingDocumentUrl(packageId, this.config, options);
  }

  isOrderPrintable(
    order: TiktokPrintEligibilityCandidate,
    allowReprint?: boolean,
  ): TiktokPrintEligibilityResult {
    return isTiktokOrderPrintable(order, allowReprint);
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

  async searchReturnsByUpdateTime(updateTimeGe: number, updateTimeLt: number, params: {page_size: number;page_token?: string}): Promise<ResponseReturnOrdersDataDto> {
    return await searchReturnsByUpdateTime(updateTimeGe, updateTimeLt, params, this.config);
  }

  async searchPackage(payload: TiktokRequestSearchPackage, params: { page_size: number; page_token?: string; sort_field?: string; sort_order?: string }): Promise<any> {
    return await searchPackage(payload, params, this.config);
  } 

  async getOrderByCreateTimeRange(timeFrom: number, timeTo: number, params: { page_size: number; page_token?: string }): Promise<any> {
    return await getOrdersByCreateTimeRange(timeFrom, timeTo, params, this.config);
  }

  async getStatements(
    params: TiktokGetStatementsParams,
  ): Promise<TiktokFinanceResponse<TiktokStatementListData>> {
    return await getStatements(params, this.config);
  }

  async getStatementTransactions(
    params: TiktokGetStatementTransactionsParams,
  ): Promise<TiktokFinanceResponse<TiktokStatementTransactionListData>> {
    return await getStatementTransactions(params, this.config);
  }

  async getOrderStatementTransactions(
    params: TiktokGetOrderStatementTransactionsParams,
  ): Promise<TiktokFinanceResponse<TiktokStatementTransactionListData>> {
    return await getOrderStatementTransactions(params, this.config);
  }

  async getPayments(
    params: TiktokGetPaymentsParams,
  ): Promise<TiktokFinanceResponse<TiktokPaymentListData>> {
    return await getPayments(params, this.config);
  }

  async getWithdrawals(
    params: TiktokGetWithdrawalsParams,
  ): Promise<TiktokFinanceResponse<TiktokWithdrawalListData>> {
    return await getWithdrawals(params, this.config);
  }

  async getUnsettledTransactions(
    params: TiktokGetUnsettledTransactionsParams,
  ): Promise<TiktokFinanceResponse<TiktokUnsettledTransactionListData>> {
    return await getUnsettledTransactions(params, this.config);
  }
}
