import api, { setAuthenticationPromise } from "../api";
import { setConfig } from "../config";
import connector from "./connector";

export default ({ api_token, access_token, ...config }, reset) => {
  setConfig(config);
  let promise;

  if (!reset && access_token) {
    promise = Promise.resolve(access_token);
  } else {
    promise = connector(api_token, reset);
  }

  setAuthenticationPromise(promise);
  return promise;
};

export const authenticatedRequest = api;
