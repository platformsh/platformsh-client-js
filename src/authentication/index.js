import api, { setAuthenticationPromise } from '../api';
import { setConfig } from '../config';
import connector from './connector';

export default ({ api_token, access_token, ...config }) => {
  setConfig(config);
  let promise;

  if(access_token) {
    promise = Promise.resolve(access_token);
  } else {
    promise = connector(api_token);
  }

  setAuthenticationPromise(promise);
  return promise;
};

export const authenticatedRequest = api;
