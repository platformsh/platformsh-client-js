import isNode from "detect-node";
import { OAuth2PopupFlow } from "oauth2-popup-flow";
import "cross-fetch/polyfill"; // fetch api polyfill

import { request } from "../api";
import type {
  ClientConfiguration,
  DefaultClientConfiguration
} from "../config";
import { getConfig } from "../config";
import type { PKCERequest } from "../jso";
import {
  jso_configure,
  jso_ensureTokens,
  jso_getToken,
  jso_getAuthRequest,
  jso_checkfortoken,
  jso_wipe,
  jso_wipeStates,
  jso_saveToken,
  set_token_expiration,
  encodeURL,
  generatePKCE,
  jso_checkforcode,
  jso_saveCodeVerifier,
  jso_getCodeVerifier
} from "../jso";

type IFrameOption = {
  sandbox?: string;
};

let basicAuth: string;

if (isNode) {
  basicAuth = Buffer.from("platform-cli:", "latin1").toString("base64");
} else {
  basicAuth = btoa("platform-cli:");
}

const createIFrame = (
  src: string,
  options: IFrameOption = {}
): HTMLIFrameElement => {
  let iframe: HTMLIFrameElement = document.getElementById(
    "logiframe-platformsh"
  ) as HTMLIFrameElement;

  if (iframe) {
    return iframe;
  }

  iframe = document.createElement("iframe");

  iframe.id = "logiframe-platformsh";
  iframe.style.display = "none";
  if (options.sandbox) {
    iframe.setAttribute("sandbox", options.sandbox);
  }
  iframe.src = src;
  document.body.appendChild(iframe);

  if (iframe.contentWindow) {
    iframe.contentWindow.onerror = msg => {
      if (msg === "[IFRAME ERROR MESSAGE]") {
        return true;
      }
    };
  }

  return iframe;
};

const removeIFrame = () => {
  const iframe = document.getElementById("logiframe-platformsh");

  if (!iframe) {
    return;
  }

  document.body.removeChild(iframe);
};

const checkForStorageAccess = async (auth: ClientConfiguration) =>
  new Promise((resolve, reject) => {
    removeIFrame();

    createIFrame(`${auth.authentication_url}/request-storage-access.html`);
    const receiveMessage = (event: MessageEvent) => {
      if (event.origin !== auth.authentication_url) {
        return false;
      }
      const { data } = event;

      window.removeEventListener("message", receiveMessage, false);

      removeIFrame();

      if (data.granted) {
        resolve(data);
      } else {
        reject(new Error());
      }
    };

    window.addEventListener("message", receiveMessage, false);
  });

const logInWithToken = async (token: string) => {
  const credentials = {
    grant_type: "api_token",
    api_token: token
  };
  const headers = {
    Authorization: `Basic ${basicAuth}`
  };
  const { authentication_url } = getConfig();

  return request(
    `${authentication_url}/oauth2/token`,
    "POST",
    credentials,
    headers
  );
};

const getTokenWithAuthorizationCode = async (
  authenticationUrl: string,
  clientId: string,
  redirectUri: string,
  codeVerifier: string,
  code: string
) => {
  const basicAuthHeader = btoa(`${clientId}:`);

  const credentials = {
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
    code_verifier: codeVerifier
  };

  const resp = await fetch(`${authenticationUrl}/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuthHeader}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(credentials)
  });

  if (resp.status !== 200) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw resp;
  }

  return resp.json();
};

const authorizationCodeCallback = async (
  config: DefaultClientConfiguration,
  codeVerifier: string,
  code: string,
  state?: string
) => {
  const atoken = await getTokenWithAuthorizationCode(
    config.authentication_url,
    config.client_id,
    config.redirect_uri,
    codeVerifier,
    code
  );

  set_token_expiration(atoken);

  jso_saveToken(config.provider, atoken);

  localStorage.removeItem(`state-${config.provider}-${state}`);
  localStorage.removeItem(`${config.provider}-code-verifier`);

  return atoken;
};

const logInWithRedirect = async (
  reset = false,
  extraParams?: Record<string, string>
) => {
  console.log("In redirect...");
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const config = getConfig();
    const auth = {
      ...config,
      response_mode: config.response_mode,
      prompt: config.prompt
    };
    let pkce: PKCERequest;

    if (!auth.client_id) {
      reject(new Error("Client_id in AUTH_CONFIG is mandatory"));
    }
    // ensure that there is an access token, redirecting to auth if needed
    if (!auth.redirect_uri) {
      // Some targets just need some dynamism
      auth.redirect_uri = window.location.origin;
    }

    jso_configure({ [auth.provider]: auth });

    const storedToken = jso_getToken(auth.provider);

    if (storedToken && !reset) {
      resolve(storedToken);
      return;
    }

    jso_wipe();

    const req = jso_getAuthRequest(auth.provider, auth.scope);

    // Override for redirect
    auth.response_mode = "";
    auth.prompt = "";

    if (auth.response_type === "code") {
      // Check for code
      const oauthResp = jso_checkforcode();

      if (oauthResp) {
        const codeVerifier = jso_getCodeVerifier(config.provider);
        if (codeVerifier && oauthResp.code) {
          resolve(
            await authorizationCodeCallback(
              auth,
              codeVerifier,
              oauthResp.code,
              req.state
            )
          );
          return;
        }
      }

      pkce = await generatePKCE();

      req.code_challenge = pkce.codeChallenge;

      req.code_challenge_method = "S256";

      jso_saveCodeVerifier(auth.provider, pkce.codeVerifier);
    } else {
      try {
        jso_checkfortoken(auth.client_id, auth.provider, undefined, false);
        const token = jso_getToken(auth.provider);
        localStorage.removeItem(`state-${req.providerID}-${req.state}`);
        resolve(token);
        return;
      } catch {
        //
      }
    }

    const authUrl = encodeURL(auth.authorization, { ...req, ...extraParams });

    const iframe = createIFrame(authUrl, {
      sandbox: "allow-same-origin"
    });
    let attempt = 0;

    const listener = setInterval(async () => {
      let href;
      let iframeDidReturnError;

      try {
        href = iframe.contentWindow?.location.href;

        // Firefox doesn't throw an exception for the above but instead it returns
        // the following string. Chrome throws an exception, which is caught below.
        if (href === "about:blank") {
          iframeDidReturnError = true;
        }
      } catch (error) {
        iframeDidReturnError = true;
      }

      if (iframeDidReturnError) {
        // Retry once in the event there was a network issue.
        if (attempt < 1) {
          attempt++;
          return false;
        }

        clearInterval(listener);
        removeIFrame();
        localStorage.removeItem(`state-${req.providerID}-${req.state}`);

        return jso_ensureTokens(
          { [auth.provider]: auth.scope },
          true,
          auth.onBeforeRedirect,
          auth.response_type === "code" ? pkce.codeChallenge : undefined
        );
      }

      if (href && (href.includes("access_token") || href.includes("code"))) {
        clearInterval(listener);
        if (auth.response_type === "code") {
          // Check for code
          const oauthResp = jso_checkforcode(href);

          if (oauthResp?.code) {
            resolve(
              await authorizationCodeCallback(
                auth,
                pkce.codeVerifier,
                oauthResp?.code,
                req.state
              )
            );
            return;
          }
        }
        jso_checkfortoken(auth.client_id, auth.provider, href, true);
        const token = jso_getToken(auth.provider);
        localStorage.removeItem(`state-${req.providerID}-${req.state}`);
        removeIFrame();
        resolve(token);
      }
    }, 500);
  });
};

export const logInWithPopUp = async (reset = false) => {
  if (localStorage.getItem("redirectFallBack") === "true") {
    localStorage.removeItem("redirectFallBack");
    return logInWithRedirect();
  }

  const authConfig = getConfig();

  jso_configure({ [authConfig.provider]: authConfig }, {}, true);

  const storedToken = jso_getToken(authConfig.provider);

  if (storedToken && !reset) {
    return storedToken;
  }

  const authRequest = jso_getAuthRequest(
    authConfig.provider,
    authConfig.scope,
    undefined,
    ""
  );

  const auth = new OAuth2PopupFlow({
    authorizationUri: authConfig.authorization,
    clientId: authConfig.client_id,
    redirectUri: authConfig.redirect_uri,
    scope: authConfig.scope?.join(","),
    accessTokenStorageKey: `raw-token-${authRequest.providerID}`,
    additionalAuthorizationParameters: {
      state: authRequest.state ?? ""
    },
    afterResponse: () => {
      // Check that the redirect response state is valid
      jso_checkfortoken(
        authConfig.client_id,
        authConfig.provider,
        undefined,
        true
      );
    }
  });

  // Open the popup and wait for
  const popupResp = await auth.tryLoginPopup();

  // If the popup fail, fallback to redirect
  if (popupResp === "POPUP_FAILED") {
    localStorage.setItem("redirectFallBack", "true");
    return logInWithRedirect();
  }

  // Authentication in the popup is successfull
  // Remove all the states in the localStorage
  jso_wipeStates();

  return jso_getToken(authConfig.provider);
};

// If you read the Authentication in Console, you already have an idea of what it's going on here
const logInWithWebMessageAndPKCE = async (reset: boolean) => {
  // The first thing we do is to get the config
  const auth = getConfig();

  // Then we return a pending promise that will handle the authentication
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      // Some guards. If we don't have the client_id specified there is no use trying to run authentication
      if (!auth.client_id) {
        reject(new Error("Client_id in AUTH_CONFIG is mandatory"));
      }

      // If the redirect_uri isn't specified, we will take the current origin (we specify it on console,
      // but if we didn't, this would be set to console.platform.sh)
      if (!auth.redirect_uri) {
        auth.redirect_uri = window.location.origin;
      }

      // Then we "configure" the config. We are not going to review the implementation for simplicity sake, but we:
      // 1. Check that the provided configure is not in popUp mode, and that it has the response_type set to token (our case)
      // 2. Check if the hash contains an access token. And if it do, extract the state, compare with config, and store the access token for later use.
      jso_configure({ [auth.provider]: auth });

      // Then we access the token here
      const storedToken = jso_getToken(auth.provider);

      // If we found a token and we don't want to refres, we will resolve with this token
      if (storedToken && !reset) {
        resolve(storedToken);
      }

      // If not, we will delete all tokens and remove any existing iframes
      jso_wipe();
      removeIFrame();

      // Remember that after authenticating in the auth ui, we are redirected to console with code and
      // state in the query params. Here we check the query params an get the code and the state.
      const oauthResp = jso_checkforcode();
      // If we found them, it means that we just got redirected from the auth ui. We are going to request
      // our first token!
      if (oauthResp) {
        // We now get the code verifier from localStorage (remember that console always has it on the localStorage)
        const codeVerifier = jso_getCodeVerifier(auth.provider);

        if (codeVerifier && oauthResp.code && oauthResp.state) {
          // Now we resolve
          resolve(
            // In this function, we get the token by making a request to get it, sending the code and the code_verifier. We also send
            // the string "platform-cli:" encoded on base64 in the Authorization header. This is so that Auth Server
            // knows that we are a trusted client. If we get the token, we will set it's expiration, save it, and
            // then remove the state and the code_verifier from the localStorage.
            await authorizationCodeCallback(
              auth,
              codeVerifier,
              oauthResp.code,
              oauthResp.state
            )
          );
        }
      }

      // If we are here it means 1. We don't have the code on the query params or 2. We don't have the code_verifier in the local storage
      // either ways, it means it's not our first token request, so we need to prepare the iframe silent token refresh. In order to do this
      // cross domain iframe trick, we need the Storage Access API. So if we don't have access, we will request it. This will create an
      // iframe, and set it's src to <authOrigin>/request-storage-access.html. It will give us an HTML as a response, that contains an
      // script granting us access to make this operation.
      if (document.hasStorageAccess !== null) {
        await checkForStorageAccess(auth);
      }

      // Then, we will wrab the request from localStorage
      const req = jso_getAuthRequest(auth.provider, auth.scope);

      // We will generate a new code_challenge and a new code_verifier
      const pkce = await generatePKCE();

      // And we will set the request code_challenge to the one we just generated
      req.code_challenge = pkce.codeChallenge;
      req.code_challenge_method = "S256";

      // Here we define a fallback so that if the silent token refresh fails we have a way to reauthenticate the user. It's worst beacuse
      // it stops our users and make them reauthenticate.
      const timeout = setTimeout(() => {
        // If we have the popupMode enabled (meaning we will interrupt our users and prompt them with a popUp to reauthenticate),
        // we will resolve with it.
        if (auth.popupMode) {
          resolve(logInWithPopUp());
          return;
        }

        // If we don't, then we will redirect them to auth ui so that they authenticate
        resolve(logInWithRedirect());
      }, 5000);

      // This function is later used as the handler of an event listener that listen to messages. This is the function that will
      // run if we receive a message from an iframe
      const receiveMessage = async (event: MessageEvent) => {
        // If the message is not from an auth iframe, we don't care about it
        if (event.origin !== auth.authentication_url) {
          return false;
        }
        // We grab the data from the message
        const { data } = event;

        // If there is an error, or que don't have a payload, or the message isn't the one we expect, we do the same as with the fallback
        // "if the silent token refresh fails we have a way to reauthenticate the user. It's worst beacuse
        // it stops our users and make them reauthenticate."
        if (data.error || !data.payload || data.state !== req.state) {
          // If we have the popupMode enabled (meaning we will interrupt our users and prompt them with a popUp to reauthenticate),
          // we will resolve with it.
          if (auth.popupMode) {
            return logInWithPopUp();
          }

          // If we don't, then we will redirect them to auth ui so that they authenticate
          return logInWithRedirect();
        }

        // If we are here, it means the message is what we expected, so we remove the request form the localStorage
        localStorage.removeItem(`state-${req.providerID}-${req.state}`);
        // And also the event listener, because we already have what we wanted
        window.removeEventListener("message", receiveMessage, false);

        // We also clear the timeout of 5 seconds that runs the fallback, because if we are here it means the silent refresh
        // is going well
        clearTimeout(timeout);

        // We get the code from the payload of the data of the message
        const code = data.payload;

        // We resolve with the code and the code_verifier we generated before
        resolve(
          await authorizationCodeCallback(
            auth,
            pkce.codeVerifier,
            code,
            req.state
          )
        );
        return;
      };

      // Here we add the event listener that listen to messages of iframes
      window.addEventListener("message", receiveMessage, false);

      // And here we create the auth iframe!
      const authUrl = encodeURL(auth.authorization, req);
      createIFrame(authUrl);
    } catch (err) {
      // If anything happen, we catch it and run the fallback
      console.log("Error Silent refresh");
      console.log(err);
      if (auth.popupMode) {
        void logInWithPopUp();
      }
      console.log("Error In web message mode, trying redirect...");
      void logInWithRedirect();

      // That is it! Authentication in Console
    }
  });
};

// This function takes a token, a reset value and a config (already described in previous steps)
export default async (
  token?: string,
  reset = false,
  config?: Partial<ClientConfiguration>
) => {
  // If we are running the client through NodeJS, we use the token to authenticate
  if (isNode && token) {
    return logInWithToken(token).catch(e => new Error(e));
  }

  // If we have extra_params, we use the only login function that works with them
  if (config?.extra_params && Object.entries(config.extra_params).length) {
    return logInWithRedirect(reset, config.extra_params);
  }

  // Console usecase!
  if (config?.response_mode === "web_message" && config.prompt === "none") {
    return logInWithWebMessageAndPKCE(reset);
  }

  // If we run with the popUp mode enabled
  if (config?.popupMode) {
    return logInWithPopUp(reset);
  }

  // If not, we fallback to logIn with redirection
  return logInWithRedirect(reset, config?.extra_params);
};

// Now let's review the console usecase! Go to line 392
