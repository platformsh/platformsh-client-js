import api, { setAuthenticationPromise } from "../api";
import connector, { logInWithPopUp } from "./connector";

import { jso_wipe } from "../jso";

export default (
  {
    api_token,
    access_token,
    provider = "cg",
    popupMode,
    response_mode,
    prompt
  },
  reset
) => {
  let promise;

  if (access_token) {
    promise = Promise.resolve({ access_token, expires: -1 });
  } else {
    promise = connector(api_token, reset, {
      provider,
      popupMode,
      response_mode,
      prompt
    });
  }

  setAuthenticationPromise(promise);
  return promise;
};

export const authenticatedRequest = api;

export const wipeToken = jso_wipe;
