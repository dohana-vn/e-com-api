import { fetchTokenWithAuthCode, generateAuthLink, refreshToken } from './api/authorization.api';
import { HaravanConfig } from './dto/request/config.request';
import { HaravanTokenResponse } from './dto/response/config.response';

export class HaravanModule {
  private config: HaravanConfig;

  constructor(config: HaravanConfig) {
    this.config = config;
  }

  setConfig(config: Partial<HaravanConfig>) {
    if (config.accessToken !== undefined) this.config.accessToken = config.accessToken;
    if (config.refreshToken !== undefined) this.config.refreshToken = config.refreshToken;
    if (config.expiresIn !== undefined) this.config.expiresIn = config.expiresIn;
    if (config.orgId !== undefined) this.config.orgId = config.orgId;
    if (config.shopId !== undefined) this.config.shopId = config.shopId;
    if (config.redirectUri !== undefined) this.config.redirectUri = config.redirectUri;
  }

  getConfig(): HaravanConfig {
    return this.config;
  }

  generateAuthLink(redirectUri: string, state?: string) {
    return generateAuthLink(redirectUri, this.config, state);
  }

  async fetchTokenWithAuthCode(code: string): Promise<HaravanTokenResponse> {
    return fetchTokenWithAuthCode(code, this.config);
  }

  async refreshToken(): Promise<HaravanTokenResponse> {
    return refreshToken(this.config);
  }
}

export { HaravanConfig, HaravanTokenResponse };
