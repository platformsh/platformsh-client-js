import "isomorphic-fetch"; // fetch api polyfill
require("es6-promise").polyfill();
import param from "to-querystring";
import isNode from "detect-node";

import { getConfig } from "./config";
import authenticate from "./authentication";

let authenticationPromise;

export const setAuthenticationPromise = promise => {
  authenticationPromise = promise;
};

const defaultHeaders = {};

if (isNode) {
  defaultHeaders["Content-Type"] = "application/json";
}

export const request = (url, method, data, additionalHeaders = {}) => {
  let body = data && { ...data };
  let apiUrl = url;

  if (method === "GET") {
    const queryString = param(body || {});

    apiUrl = `${url}${queryString.length ? `?${queryString}` : ""}`;
  }

  const requestConfig = {
    method,
    headers: { ...defaultHeaders, ...additionalHeaders }
  };

  if (method !== "GET" && method !== "HEAD" && body) {
    requestConfig.body = JSON.stringify(body);
  }

  return new Promise((resolve, reject) => {
    fetch(apiUrl, requestConfig)
      .then(response => {
        if (response.status === 401) {
          const config = getConfig();
          authenticate(config, true).then(t => {
            resolve(authenticatedRequest(url, method, data, additionalHeaders));
          });
        }

        const headers = response.headers;
        const type = headers.get("Content-Type");

        if (response.ok) {
          if (!type || type === "application/json") {
            return resolve(response.json());
          }

          const text = response.text();

          return resolve(text);
        }

        if (!type || type === "application/json") {
          return response.json().then(data => reject(data));
        }

        response.text().then(data => reject(data));
      })
      .catch(err => {
        reject(err);
      });
  });
};

export const authenticatedRequest = (
  url,
  method,
  data,
  additionalHeaders = {}
) => {
  return authenticationPromise.then(token => {
    if (!token) {
      throw new Error("Token is mandatory");
    }

    console.log(`authenticatedRequest token ${token}`);
    // Same calc in the jso lib
    const currentDate = Math.round(new Date().getTime() / 1000.0);
    const tokenExpirationDate = token.expires;

    if (currentDate >= tokenExpirationDate) {
      const config = getConfig();
      console.log("Token expiration detected");

      return authenticate(config, true).then(t => {
        return authenticatedRequest(url, method, data, additionalHeaders);
      });
    }

    const authenticationHeaders = {
      Authorization: `Bearer ${token["access_token"]}`
    };

    return request(url, method, data, {
      ...additionalHeaders,
      ...authenticationHeaders
    });
  });
};

export const createEventSource = url =>
  authenticationPromise.then(
    token =>
      new window.EventSource(`${url}?access_token=${token["access_token"]}`)
  );

export default authenticatedRequest;
