import 'isomorphic-fetch'; // fetch api polyfill
require('es6-promise').polyfill();
import param from 'to-querystring';

import { getConfig } from './config';
import authenticate from './authentication';

let authenticationPromise;

const defaultHeaders = {
};

export const request = (url, method, data = {}, additionalHeaders = {}) => {
  let body = {...data};
  let apiUrl = url;

  if(method === 'GET') {
    const queryString = param(body);

    apiUrl = `${url}${queryString.length ? `?${queryString}` : ''}`;
  }

  const requestConfig = {
    method,
    headers: {...defaultHeaders, ...additionalHeaders}
  };

  if(method !== 'GET' && method !== 'HEAD' && body) {
    requestConfig.body = JSON.stringify(body);
  }

  return fetch(apiUrl, requestConfig)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else if(response.status === 401) {
        const config = getConfig();

        authenticate(config, true)
          .then(() => request(url, method, data, additionalHeaders));
      }
    });
};

export const authenticatedRequest = (url, method, data = {}, additionalHeaders = {}) => {
  return authenticationPromise
    .then(token => {
      if(!token) {
        throw new Error('Token is mandatory');
      }

      const authenticationHeaders = {
        Authorization: `Bearer ${token}`
      };

      return request(url, method, data, { ...additionalHeaders, ...authenticationHeaders});
    });
};

export const createEventSource = url =>
  authenticationPromise
    .then(token => new window.EventSource(`${url}?access_token=${token}`));

export const setAuthenticationPromise = promise => {
  authenticationPromise = promise;
};

export default authenticatedRequest;
