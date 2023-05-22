import api, {
  setAuthenticationPromise,
  getAuthenticationPromise
} from "../api";
import type { ClientConfiguration } from "../config";
import { jso_wipe } from "../jso";

import connector from "./connector";

let authenticationInProgress = false;

export type JWTToken = {
  access_token: string;
  expires: number;
  expires_in: number;
  token_type: string;
  scope: string;
};

// This is the function. It receives a config, and runs the authentication.
export default async (
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
  // As you can see, we declare a let variable on line 10 called authenticationInProgress.
  // We will use it to know if there is an ongoing authentication, and if so, we will return
  // the promise that handles it.
  if (authenticationInProgress) {
    return getAuthenticationPromise();
  }

  // If we don't have an outgoing authentication, we will start one.
  authenticationInProgress = true;

  // If we received an access_token in the config, we can resolve the promise with it.
  // Note that it will we are setting this token with a negative expiration. When we
  // call the function filterTokens() this token will be wiped out
  const promise = access_token
    ? Promise.resolve({ access_token, expires: -1 })
    : // If not, we will try to get an access token. API tokens are used if you are running
      // the client in NodeJS, which is not our case. Reset is set to false by default. We
      // set it to true if the function is called through reAuthenticate(), defined in line
      // 50 in /src/index.ts
      connector(api_token, reset, {
        provider,
        // This defines if we should open a popup to handle authentication, we don't use it on Console
        popupMode,
        // This is set to web_message on Console, triggering the iframe creation
        response_mode,
        // This is set to none, so that we don't promp the user to authenticate in Console,
        // doing a silent token refresh with the iframes
        prompt,
        // This is in case you want to use extra parameters, we don't use it on Console
        extra_params
      });

  // Now that we have defined the promise, if we have any, we will:
  if (promise) {
    // Set the authenticationPromise to the promise, this will allow us to get the
    // promise anywhere in the application
    setAuthenticationPromise(promise);

    // Make sure to set the authenticationInProgress to false once the promise is resolved
    void promise.then(() => {
      authenticationInProgress = false;
    });

    // Return the promise
    return promise;
  }

  // If we don't have a promise, something went wrong :(
  return Promise.reject(new Error());
};

// Now lets go to read the connector function, go to line 557 in /src/authentication/connector.ts

export const authenticatedRequest = api;

export const wipeToken = jso_wipe;
