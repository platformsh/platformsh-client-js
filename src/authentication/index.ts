import { setAuthenticationPromise, getAuthenticationPromise } from "../api";
import type { ClientConfiguration } from "../config";
import { jso_wipe } from "../jso";

import { connector } from "./connector";

let authenticationInProgress = false;

export type JWTToken = {
  access_token: string;
  expires: number;
  expires_in: number;
  token_type: string;
  scope: string;
};

export const authenticate = async (
  {
    api_token,
    access_token,
    provider = "cg",
    popupMode,
    response_mode,
    prompt,
    ignoredSubdirectories,
    extra_params
  }: ClientConfiguration,
  reset = false
): Promise<JWTToken> => {
  if (authenticationInProgress) {
    return getAuthenticationPromise();
  }

  authenticationInProgress = true;

  const shouldIgnore = ignoredSubdirectories?.some(subdirectory =>
    window.location.pathname.startsWith(subdirectory)
  );

  const promise = access_token
    ? Promise.resolve({ access_token, expires: -1 })
    : shouldIgnore
    ? Promise.resolve({ access_token: "", expires: -2 } as JWTToken)
    : connector(api_token, reset, {
        provider,
        popupMode,
        response_mode,
        prompt,
        extra_params
      });

  if (promise) {
    setAuthenticationPromise(promise);

    void promise.then(() => {
      authenticationInProgress = false;
    });

    return promise;
  }

  return Promise.reject(new Error());
};

export const wipeToken = jso_wipe;
