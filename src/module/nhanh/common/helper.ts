import { NhanhConfig } from '../dto';
import axios, { AxiosResponse } from 'axios';

function commonParameter(config, params) {
  return params;
}

function objKeySort(obj) {
  const newKey = Object.keys(obj).sort();
  const newObj = {};
  for (let i = 0; i < newKey.length; i++) {
    newObj[newKey[i]] = obj[newKey[i]];
  }
  return newObj;
}

function handleError(err: any) {
  return err.response ? err.response.data : { error: 'Unknown error' };
}

function getHeaders(config: NhanhConfig) {
  return {
    'content-type': 'application/json',
    Authorization: config.accessToken || '',
  };
}

async function httpPost(url: string, body: any, headers: any) {
  const res: AxiosResponse = await axios.post(url, body, {
    headers,
  });
  return res.data;
}

async function httpGet(url: string, config: NhanhConfig) {
  const res: AxiosResponse = await axios.get(url, {
    headers: getHeaders(config),
  });
  return res.data;
}

function getTimestamp() {
  return new Date().getTime();
}

function isAccessTokenValid(time: any): boolean {
  if (time.toString().length === 13) {
    time = time / 1000;
  }
  const now = Math.floor(Date.now() / 1000);
  return time > now;
}

function isTokenExpired(time: any): boolean {
  if (time.toString().length === 13) {
    time = time / 1000;
  }
  const now = Math.floor(Date.now() / 1000);

  // If expiration time is less than or equal to current time, it's expired
  return time <= now;
}

export { httpGet, httpPost, getHeaders, getTimestamp, commonParameter, isAccessTokenValid, isTokenExpired };
