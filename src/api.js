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
        const isJson =
          !type ||
          type === "application/json" ||
          type === "application/hal+json; charset=utf-8";

        if (response.ok) {
          if (isJson) {
            return resolve(response.json());
          } else if (type === "application/x-json-stream") {
            const text = response.text();
            return resolve(text);
          }

          return resolve(response);
        }

        if (isJson) {
          return response
            .json()
            .then(data => reject(data))
            .catch(error => {
              console.log(error);
            });
        }
        return response.text().then(data => reject(data));
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

    // Same calc in the jso lib
    const currentDate = Math.round(new Date().getTime() / 1000.0);
    const tokenExpirationDate = token.expires;

    if (tokenExpirationDate !== -1 && currentDate >= tokenExpirationDate) {
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
