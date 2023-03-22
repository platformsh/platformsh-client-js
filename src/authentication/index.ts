import api, {
  setAuthenticationPromise,
  getAuthenticationPromise
} from "../api";
import connector from "./connector";

import { jso_wipe } from "../jso";

import { ClientConfiguration } from "../config";

let authenticationInProgress: boolean = false;

export type JWTToken = {
  access_token: string;
  expires: number;
  expires_in: number;
  token_type: string;
  scope: string;
};

export default (
  {
    api_token,
    access_token,
    provider = "cg",
    popupMode,
    response_mode,
    prompt,
    extra_params
  }: ClientConfiguration,
  reset = false
): Promise<JWTToken> => {
  let promise;

  if (authenticationInProgress) {
    return getAuthenticationPromise();
  }

  authenticationInProgress = true;

  if (access_token) {
    promise = Promise.resolve({ access_token, expires: -1 });
  } else {
    promise = connector(api_token, reset, {
      provider,
      popupMode,
      response_mode,
      prompt,
      extra_params
    });
  }

  if (promise) {
    setAuthenticationPromise(promise);

    promise.then(() => {
      authenticationInProgress = false;
    });

    return promise;
  }

  return Promise.reject();
};

export const authenticatedRequest = api;

export const wipeToken = jso_wipe;
