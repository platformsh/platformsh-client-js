import 'isomorphic-fetch'; // fetch api polyfill
require('es6-promise').polyfill();
import param from 'to-querystring';

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

  const requestConfig = {
    method,
    headers: {...defaultHeaders, ...additionalHeaders}
  };

  if(method !== 'GET' && method !== 'HEAD' && body) {
    requestConfig.body = JSON.stringify(body);
  }

  return fetch(apiUrl, requestConfig).then(data => data.json());
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

export const createEventSource = (url) => {
  return new window.EventSource(`${url}?access_token=${token}`);
};

export const setToken = newToken => {
  token = newToken;
};

export default authenticatedRequest;
