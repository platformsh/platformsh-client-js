import api, { setAuthenticationPromise } from '../api';
import connector from './connector';

export default ({ api_token, access_token }) => {
  let promise;

  if(access_token) {
    promise = Promise.resolve(access_token);
  }

  promise = connector(api_token);

  setAuthenticationPromise(promise);
  return promise;
};

export const authenticatedRequest = api;
