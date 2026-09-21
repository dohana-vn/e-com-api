interface Config {
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
  orgId?: string;
  shopId?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

export { Config as HaravanConfig };
