import axios from 'axios';
import { randomBytes } from 'crypto';
import { HARAVAN_AUTHORIZATION_URL, HARAVAN_DEFAULT_SCOPE, HARAVAN_RESPONSE_MODE, HARAVAN_RESPONSE_TYPE, HARAVAN_TOKEN_URL } from '../common/constant';
import { HaravanConfig } from '../dto/request/config.request';
import { HaravanTokenResponse } from '../dto/response/config.response';

export function generateNonce(): string {
  return randomBytes(16).toString('hex');
}

export function generateAuthLink(redirectUri: string, config: HaravanConfig, state?: string) {
  const nonce = generateNonce();
  const queryParams = new URLSearchParams({
    response_mode: HARAVAN_RESPONSE_MODE,
    response_type: HARAVAN_RESPONSE_TYPE,
    scope: HARAVAN_DEFAULT_SCOPE,
    client_id: config.clientId,
    redirect_uri: redirectUri,
    nonce: nonce,
  });

  if (state) {
    queryParams.set('state', state);
  }

  const url = `${HARAVAN_AUTHORIZATION_URL}?${queryParams.toString()}`;

  return { url, redirect: redirectUri, nonce };
}

export async function fetchTokenWithAuthCode(code: string, config: HaravanConfig): Promise<HaravanTokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code: code,
    redirect_uri: config.redirectUri || '',
  });

  const res = await axios.post<HaravanTokenResponse>(HARAVAN_TOKEN_URL, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return res.data;
}

export async function refreshToken(config: HaravanConfig): Promise<HaravanTokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: config.refreshToken || '',
  });

  const res = await axios.post<HaravanTokenResponse>(HARAVAN_TOKEN_URL, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return res.data;
}
