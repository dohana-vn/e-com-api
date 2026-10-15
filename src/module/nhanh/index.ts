export * from './dto'
import { NhanhConfig, NhanhDepotListRequest, NhanhInventorySearchRequest, NhanhOrderListRequest, NhanhProductSearchRequest, NhanhResponseAccessToken, NhanhResponseDepotListData, NhanhResponseInventoryListData, NhanhResponseOrderList } from './dto';
import * as AuthorizationApi from './api/authorization.api';
import { getListProduct } from './api/product.api';
import { getOrderList } from './api/order.api';
import { getDepotList } from './api/depot.api';
import { getInventoryList } from './api/inventory.api';

export class NhanhModule {
  private config: NhanhConfig;

  constructor(config: NhanhConfig) {
    this.config = config;
  }

  setConfig(config: NhanhConfig) {
    this.config.returnLink = config.returnLink;
    this.config.version = config.version;
    this.config.appSecret = config.appSecret;
  }

  getConfig(): NhanhConfig {
    return this.config;
  }

  async fetchTokenWithAuthCode(authCode: string): Promise<NhanhResponseAccessToken> {
    return await AuthorizationApi.fetchTokenWithAuthCodeNhanh(authCode, this.config);
  }

  async generateAuthLink(): Promise<any> {
    return AuthorizationApi.generateAuthLinkNhanh(this.config);
  }

  async getListProduct({params}: {params: NhanhProductSearchRequest}): Promise<any> {
    return await getListProduct(params, this.config);
  }

  async getOrderList(params: NhanhOrderListRequest): Promise<NhanhResponseOrderList> {
    return await getOrderList(params, this.config);
  }

  async getDepotList({ params }: { params: NhanhDepotListRequest }): Promise<NhanhResponseDepotListData> {
    return await getDepotList(params, this.config);
  }

  async getInventoryList({ params }: { params: NhanhInventorySearchRequest }): Promise<NhanhResponseInventoryListData> {
    return await getInventoryList(params, this.config);
  }
}