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

    if (extraParams) {
      const { prompt, response_mode, ...params } = {
        ...req,
        ...extraParams
      };

      // eslint-disable-next-line require-atomic-updates
      window.location.href = encodeURL(auth.authorization, {
        ...params
      });
      return;
    }

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
        } else {
          const { prompt, response_mode, ...params } = {
            ...req
          };

          window.location.href = encodeURL(auth.authorization, {
            ...params
          });
          return;
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

const logInWithWebMessageAndPKCE = async (reset: boolean) => {
  const auth = getConfig();

  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
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
      }

      jso_wipe();
      removeIFrame();

      // If we come from a redirect
      const oauthResp = jso_checkforcode();
      if (oauthResp) {
        const codeVerifier = jso_getCodeVerifier(auth.provider);

        if (codeVerifier && oauthResp.code && oauthResp.state) {
          resolve(
            await authorizationCodeCallback(
              auth,
              codeVerifier,
              oauthResp.code,
              oauthResp.state
            )
          );
        }
      }

      if (document.hasStorageAccess !== null) {
        await checkForStorageAccess(auth);
      }

      const req = jso_getAuthRequest(auth.provider, auth.scope);

      const pkce = await generatePKCE();

      req.code_challenge = pkce.codeChallenge;
      req.code_challenge_method = "S256";

      const timeout = setTimeout(() => {
        if (auth.popupMode) {
          resolve(logInWithPopUp());
          return;
        }

        resolve(logInWithRedirect());
      }, 5000);

      const receiveMessage = async (event: MessageEvent) => {
        if (event.origin !== auth.authentication_url) {
          return false;
        }
        const { data } = event;

        if (data.error || !data.payload || data.state !== req.state) {
          if (auth.popupMode) {
            return logInWithPopUp();
          }

          return logInWithRedirect();
        }

        localStorage.removeItem(`state-${req.providerID}-${req.state}`);
        window.removeEventListener("message", receiveMessage, false);

        clearTimeout(timeout);

        const code = data.payload;

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

      window.addEventListener("message", receiveMessage, false);

      const authUrl = encodeURL(auth.authorization, req);
      createIFrame(authUrl);
    } catch (err) {
      console.log("Error Silent refresh");
      console.log(err);
      if (auth.popupMode) {
        void logInWithPopUp();
      }
      console.log("Error In web message mode, trying redirect...");
      void logInWithRedirect();
    }
  });
};

export default async (
  token?: string,
  reset = false,
  config?: Partial<ClientConfiguration>
) => {
  if (isNode && token) {
    return logInWithToken(token).catch(e => new Error(e));
  }

  if (config?.extra_params && Object.entries(config.extra_params).length) {
    return logInWithRedirect(reset, config.extra_params);
  }

  if (config?.response_mode === "web_message" && config.prompt === "none") {
    return logInWithWebMessageAndPKCE(reset);
  }

  if (config?.popupMode) {
    return logInWithPopUp(reset);
  }

  return logInWithRedirect(reset, config?.extra_params);
};
