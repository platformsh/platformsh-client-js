import api, { setAuthenticationPromise } from "../api";
import connector from "./connector";

export default ({ api_token, access_token }, reset) => {
  let promise;

  if (access_token) {
    promise = Promise.resolve({ access_token, expires: -1 });
  } else {
    promise = connector(api_token, reset);
  }

  setAuthenticationPromise(promise);
  return promise;
};

export const authenticatedRequest = api;
