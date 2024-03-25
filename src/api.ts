import isNode from "detect-node";
import { EventSourcePolyfill as EventSource } from "event-source-polyfill";
import param from "to-querystring";
import "cross-fetch/polyfill"; // fetch api polyfill

import type { JWTToken } from "./authentication";
import authenticate from "./authentication";
import type { ClientConfiguration } from "./config";
import { getConfig } from "./config";

export type RequestOptions = {
  queryStringArrayPrefix?: string;
};

export type RequestConfiguration = RequestOptions & RequestInit;

let authenticationPromise: Promise<JWTToken>;

export const setAuthenticationPromise = (promise: Promise<JWTToken>) => {
  authenticationPromise = promise;
};

export const getAuthenticationPromise = async () => authenticationPromise;

const defaultHeaders: Record<string, string> = {};

if (isNode) {
  defaultHeaders["Content-Type"] = "application/json";
}

const isFormData = (data: FormData | object | undefined) =>
  typeof FormData !== "undefined" && data instanceof FormData;

// To transform header value string to an object:
// 'Bearer error="insufficient_user_authentication",
// error_description="More recent authentication is required",
// max_age="5"'
const decodeHeaderString = (header: string) =>
  header
    .replace("Bearer", "")
    .split(",")
    .reduce<Record<string, string>>((acc, cu) => {
      const [key, value] = cu.replace(/"/gu, "").trim().split("=");
      acc[key] = value;
      return acc;
    }, {});

const getChallengeExtraParams = (headers: Headers): Record<string, string> => {
  const wwwAuthentication = decodeHeaderString(
    headers.get("WWW-Authenticate") ?? ""
  );
  return ["max_age", "acr_values"].reduce<Record<string, string>>((acc, cu) => {
    if (wwwAuthentication[cu]) acc[cu] = wwwAuthentication[cu];
    return acc;
  }, {});
};

export const request = async (
  url: string,
  method: string,
  data?: FormData | object | undefined,
  additionalHeaders: Record<string, string> = {},
  retryNumber = 0,
  options: RequestOptions = {}
): Promise<any> => {
  const body = data instanceof Array ? data && [...data] : data && { ...data };

  let apiUrl = url;

  if (method === "GET") {
    const queryString = param(body ?? {}, "", {
      arrayPrefix: options.queryStringArrayPrefix ?? ""
    });

    apiUrl = `${url}${queryString.length ? `?${queryString}` : ""}`;
  }

  const requestConfig: RequestConfiguration = {
    method,
    ...options,
    headers: { ...defaultHeaders, ...additionalHeaders }
  };

  if (method !== "GET" && method !== "HEAD" && body) {
    const d: BodyInit = isFormData(data)
      ? (data as FormData)
      : JSON.stringify(body);
    requestConfig.body = d;
  }

  return new Promise((resolve, reject) => {
    fetch(apiUrl, requestConfig)
      .then(async response => {
        const config: ClientConfiguration = getConfig();

        if (response.status === 401) {
          const extra_params = getChallengeExtraParams(response.headers);

          if (config.hold401Responses) {
            const retry = await config.hold401Responses(response);
            if (!retry) {
              const responseAsText = await response.text();
              reject(responseAsText);
              return;
            }
          }

          // Prevent an endless loop which happens in case of re-authentication with the access token.
          // We want to retry only once, trying to renew the token.
          if (typeof config.access_token === "undefined" && retryNumber < 2) {
            return authenticate({ ...config, extra_params }, true).then(() => {
              resolve(
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                authenticatedRequest(
                  url,
                  method,
                  data,
                  additionalHeaders,
                  retryNumber + 1,
                  options
                )
              );
            });
          }
        }

        const imageTypes = ["image/gif", "image/jpeg", "image/png"];
        const { headers } = response;
        const type = headers.get("Content-Type");
        const isJson =
          !type ||
          type === "application/json" ||
          type === "application/hal+json; charset=utf-8";

        if (response.ok) {
          if ((type && imageTypes.includes(type)) || response.status === 202) {
            resolve(response);
            return;
          }

          resolve(
            // This ensures that a response with type of JSON is actually valid
            // JSON before returning it.
            response.text().then(text => {
              let responseBody;
              try {
                responseBody = JSON.parse(text);
              } catch (err) {
                responseBody = text;
              }
              return responseBody;
            })
          );
          return;
        }

        if (isJson) {
          return response
            .json()
            .then(d => {
              reject(d);
            })
            .catch(error => {
              console.log(error);
            });
        }
        return response.text().then(d => {
          reject(d);
        });
      })
      .catch(err => {
        reject(err);
      });
  });
};

export const authenticatedRequest = async (
  url: string,
  method = "GET",
  data?: FormData | object | undefined,
  additionalHeaders: Record<string, string> = {},
  retryNumber = 0,
  options: RequestOptions = {}
): Promise<any> => {
  const token = await authenticationPromise;
  if (!token) {
    throw new Error("Token is mandatory");
  }
  if (!additionalHeaders.hasOwnProperty("Content-Type") && !isFormData(data)) {
    additionalHeaders["Content-Type"] = "application/json";
  }
  // Same calc in the jso lib
  const currentDate = Math.round(new Date().getTime() / 1000);
  const tokenExpirationDate = token.expires;
  if (tokenExpirationDate === -2) {
    return;
  }
  if (tokenExpirationDate !== -1 && currentDate >= tokenExpirationDate) {
    const config = getConfig();
    console.log("Token expiration detected");

    return authenticate(config, true).then(async () =>
      authenticatedRequest(
        url,
        method,
        data,
        additionalHeaders,
        retryNumber + 1,
        options
      )
    );
  }

  const authenticationHeaders = {
    Authorization: `Bearer ${token.access_token}`
  };
  return request(
    url,
    method,
    data,
    {
      ...additionalHeaders,
      ...authenticationHeaders
    },
    retryNumber,
    options
  );
};

export const createEventSource = async (url: string) =>
  authenticationPromise.then(
    token =>
      new EventSource(url, {
        headers: {
          Authorization: `Bearer ${token.access_token}`
        }
      })
  );

export default authenticatedRequest;
