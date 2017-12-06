import 'isomorphic-fetch'; // fetch api polyfill
require('es6-promise').polyfill();
import param from 'to-querystring';

import { getConfig } from './config';
import authenticate from './authentication';

let authenticationPromise;

const defaultHeaders = {
  'Content-Type': 'application/json'
};

export const request = (url, method, data, additionalHeaders = {}) => {
  let body = data && {...data};
  let apiUrl = url;

  if(method === 'GET') {
    const queryString = param(body || {});

    apiUrl = `${url}${queryString.length ? `?${queryString}` : ''}`;
  }

  const requestConfig = {
    method,
    headers: {...defaultHeaders, ...additionalHeaders}
  };

  if(method !== 'GET' && method !== 'HEAD' && body) {
    requestConfig.body = JSON.stringify(body);
  }

  return new Promise((resolve, reject) => {
    fetch(apiUrl, requestConfig)
      .then(response => {
        if(response.status === 401) {
          const config = getConfig();

          return authenticate(config, true)
            .then(() => request(url, method, data, additionalHeaders));
        }

        if(response.ok) {
          return resolve(response.json());
        }

        response.json()
          .then(error => reject(error))
          .catch((err) => reject(err)
        );
      });
  });
};

export const authenticatedRequest = (url, method, data, additionalHeaders = {}) => {
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
