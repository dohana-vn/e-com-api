interface TokenResponse {
  id_token: string;
  access_token: string;
  expires_in: number;
  token_type: string;
  refresh_token?: string;
  scope: string;
}

interface IdTokenClaims {
  nbf: number;
  exp: number;
  iss: string;
  aud: string;
  iat: number;
  sid: string;
  sub: string;
  orgid: string;
  orgname: string;
  orgcat: string;
  email: string;
  name: string;
  middle_name: string;
  role: string[];
  locale: string;
  idp: string;
  auth_time: number;
}

export { TokenResponse as HaravanTokenResponse, IdTokenClaims as HaravanIdTokenClaims };
