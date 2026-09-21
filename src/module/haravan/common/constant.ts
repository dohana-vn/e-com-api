const AUTHORIZATION_URL = 'https://accounts.haravan.com/connect/authorize';
const TOKEN_URL = 'https://accounts.haravan.com/connect/token';
const USER_INFO_URL = 'https://accounts.haravan.com/connect/userinfo';
const API_BASE_URL = 'https://apis.haravan.com';

const RESPONSE_MODE = 'form_post';
const RESPONSE_TYPE = 'code id_token';
const DEFAULT_SCOPE = 'openid profile email org userinfo offline_access';

export {
  AUTHORIZATION_URL as HARAVAN_AUTHORIZATION_URL,
  TOKEN_URL as HARAVAN_TOKEN_URL,
  USER_INFO_URL as HARAVAN_USER_INFO_URL,
  API_BASE_URL as HARAVAN_API_BASE_URL,
  RESPONSE_MODE as HARAVAN_RESPONSE_MODE,
  RESPONSE_TYPE as HARAVAN_RESPONSE_TYPE,
  DEFAULT_SCOPE as HARAVAN_DEFAULT_SCOPE,
};
