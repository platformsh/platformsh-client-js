import 'isomorphic-fetch'; // fetch api polyfill
require('es6-promise').polyfill();
import param from 'jquery-param';

let token;

const defaultHeaders = {
};

export const request = (url, method, data = {}, additionalHeaders = {}) => {
  let body = {...data};
  let apiUrl = url;

  if(method === 'GET') {
    const queryString = param(body);

    apiUrl = `${url}${queryString.length ? `?${queryString}` : ''}`;
  }

  return fetch(apiUrl, {
    method,
    headers: {...defaultHeaders, ...additionalHeaders},
    body: method !== 'GET' && method !== 'HEAD' && JSON.stringify(body)
  }).then(data => data.json());
};

export const authenticatedRequest = (url, method, data = {}, additionalHeaders = {}) => {
  if(!token) {
    throw new Error('Token is mandatory');
  }

  const authenticationHeaders = {
    Authorization: `Bearer ${token}`
  };

  return request(url, method, data, { ...additionalHeaders, ...authenticationHeaders});
};

export const setToken = newToken => {
  token = newToken;
};

export default authenticatedRequest;
