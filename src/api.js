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

export const getAuthenticationPromise = () => {
  return authenticationPromise;
};

const defaultHeaders = {};

if (isNode) {
  defaultHeaders["Content-Type"] = "application/json";
}

const isFormData = data =>
  typeof FormData !== "undefined" && data instanceof FormData;

export const request = (
  url,
  method,
  data,
  config,
  additionalHeaders = {},
  retryNumber = 0
) => {
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
    requestConfig.body = isFormData(data) ? data : JSON.stringify(body);
  }

  return new Promise((resolve, reject) => {
    fetch(apiUrl, requestConfig)
      .then(response => {
        if (response.status === 401) {
          const conf = config || getConfig();
          // Prevent an endless loop which happens in case of re-authentication with the access token.
          // We want to retry only once, trying to renew the token.
          if (typeof conf.access_token === "undefined" && retryNumber < 2) {
            return authenticate(conf, true).then(t => {
              resolve(
                authenticatedRequest(
                  url,
                  method,
                  data,
                  conf,
                  additionalHeaders,
                  retryNumber + 1
                )
              );
            });
          }
        }

        const imageTypes = ["image/gif", "image/jpeg", "image/png"];
        const headers = response.headers;
        const type = headers.get("Content-Type");
        const isJson =
          !type ||
          type === "application/json" ||
          type === "application/hal+json; charset=utf-8";

        if (response.ok) {
          if (imageTypes.includes(type) || response.status === 202) {
            return resolve(response);
          }
          return resolve(
            // This ensures that a response with type of JSON is actually valid
            // JSON before returning it.
            response.text().then(text => {
              let body;
              try {
                body = JSON.parse(text);
              } catch (err) {
                body = text;
              }
              return body;
            })
          );
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
  config,
  additionalHeaders = {},
  retryNumber = 0
) => {
  return authenticationPromise.then(token => {
    if (!token) {
      throw new Error("Token is mandatory");
    }

    if (
      !additionalHeaders.hasOwnProperty("Content-Type") &&
      !isFormData(data)
    ) {
      additionalHeaders["Content-Type"] = "application/json";
    }

    // Same calc in the jso lib
    const currentDate = Math.round(new Date().getTime() / 1000.0);
    const tokenExpirationDate = token.expires;

    if (tokenExpirationDate !== -1 && currentDate >= tokenExpirationDate) {
      const conf = config || getConfig();
      console.log("Token expiration detected");

      return authenticate(conf, true).then(t => {
        return authenticatedRequest(
          url,
          method,
          data,
          conf,
          additionalHeaders,
          retryNumber + 1
        );
      });
    }

    const authenticationHeaders = {
      Authorization: `Bearer ${token["access_token"]}`
    };

    return request(
      url,
      method,
      data,
      config,
      {
        ...additionalHeaders,
        ...authenticationHeaders
      },
      retryNumber
    );
  });
};

export const createEventSource = url =>
  authenticationPromise.then(
    token =>
      new window.EventSource(`${url}?access_token=${token["access_token"]}`)
  );

export default authenticatedRequest;
