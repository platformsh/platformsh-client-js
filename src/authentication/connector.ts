import isNode from "detect-node";
import { OAuth2PopupFlow } from "oauth2-popup-flow";
import "isomorphic-fetch"; // fetch api polyfill

import { request } from "../api";
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
  jso_getCodeVerifier,
  PKCERequest
} from "../jso";
import { getConfig, ClientConfiguration, DefaultClientConfiguration } from "../config";

type IFrameOption = {
  sandbox?: string
};

let basicAuth: string;

if (isNode) {
  basicAuth = Buffer.from("platform-cli:", "latin1").toString("base64");
} else {
  basicAuth = btoa("platform-cli:");
}

function createIFrame(src: string, options: IFrameOption = {}): HTMLIFrameElement {
  let iframe: HTMLIFrameElement = document.getElementById("logiframe-platformsh") as HTMLIFrameElement;

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

  if(iframe.contentWindow) {
    iframe.contentWindow.onerror = function(msg, url, line) {
      if (msg === "[IFRAME ERROR MESSAGE]") {
        return true;
      }
    };
  }

  return iframe;
}

function removeIFrame() {
  let iframe = document.getElementById("logiframe-platformsh");

  if (!iframe) {
    return false;
  }

  document.body.removeChild(iframe);
}

function checkForStorageAccess(auth: ClientConfiguration) {
  return new Promise((resolve, reject) => {
    removeIFrame();

    createIFrame(`${auth.authentication_url}/request-storage-access.html`);
    async function receiveMessage(event: MessageEvent) {
      if (event.origin !== auth.authentication_url) {
        return false;
      }
      const data = event.data;

      window.removeEventListener("message", receiveMessage, false);

      removeIFrame();

      if (data.granted) {
        resolve(data);
      } else {
        reject();
      }
    }

    window.addEventListener("message", receiveMessage, false);
  });
}

function logInWithToken(token: string) {
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
}

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
    throw resp;
  }

  return await resp.json();
};

async function authorizationCodeCallback(config: DefaultClientConfiguration, codeVerifier: string, code: string, state?: string) {
  const atoken = await getTokenWithAuthorizationCode(
    config.authentication_url,
    config.client_id,
    config.redirect_uri,
    codeVerifier,
    code
  );

  set_token_expiration(atoken, config);

  jso_saveToken(config.provider, atoken);

  localStorage.removeItem(`state-${config.provider}-${state}`);
  localStorage.removeItem(`${config.provider}-code-verifier`);

  return atoken;
}

function logInWithRedirect(reset: boolean = false) {
  console.log("In redirect...");
  return new Promise(async (resolve, reject) => {
    const config = getConfig();
    const auth = {
      ...config,
      response_mode: config.response_mode,
      prompt: config.prompt,
    };
    let pkce: PKCERequest;

    if (!auth.client_id) {
      reject("Client_id in AUTH_CONFIG is mandatory");
    }
    // ensure that there is an access token, redirecting to auth if needed
    if (!auth.redirect_uri) {
      // Some targets just need some dynamism
      auth.redirect_uri = window.location.origin;
    }

    jso_configure({ [auth.provider]: auth });

    const storedToken = jso_getToken(auth.provider);

    if (storedToken && !reset) {
      return resolve(storedToken);
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
        if(codeVerifier && oauthResp.code) {
          return resolve(
            await authorizationCodeCallback(
              auth,
              codeVerifier,
              oauthResp.code,
              req.state
            )
          );
        }
      }

      pkce = await generatePKCE();

      req["code_challenge"] = pkce.codeChallenge;
      req["code_challenge_method"] = "S256";

      jso_saveCodeVerifier(auth.provider, pkce.codeVerifier);
    } else {
      try {
        jso_checkfortoken(auth.client_id, auth.provider, undefined, false);
        const token = jso_getToken(auth.provider);
        localStorage.removeItem(`state-${req.providerID}-${req.state}`);
        return resolve(token);
      } catch {}
    }

    const authUrl = encodeURL(auth.authorization, req);

    const iframe = createIFrame(authUrl, {
      sandbox: "allow-same-origin"
    });
    let attempt = 0;

    const listener = setInterval(async function() {
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

      if (
        href &&
        (href.indexOf("access_token") !== -1 || href.indexOf("code") !== -1)
      ) {
        clearInterval(listener);
        if (auth.response_type === "code") {
          // Check for code
          const oauthResp = jso_checkforcode(href);

          if (oauthResp?.code) {
            return resolve(
              await authorizationCodeCallback(
                auth,
                pkce.codeVerifier,
                oauthResp?.code,
                req.state
              )
            );
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
}

const logInWithWebMessageAndPKCE = async (reset: boolean) => {
  const auth = getConfig();

  return new Promise(async (resolve, reject) => {
    try {
      if (!auth.client_id) {
        reject("Client_id in AUTH_CONFIG is mandatory");
      }

      // ensure that there is an access token, redirecting to auth if needed
      if (!auth.redirect_uri) {
        // Some targets just need some dynamism
        auth.redirect_uri = window.location.origin;
      }

      jso_configure({ [auth.provider]: auth });
      const storedToken = jso_getToken(auth.provider);

      if (storedToken && !reset) {
        return resolve(storedToken);
      }

      jso_wipe();
      removeIFrame();

      // If we come from a redirect
      const oauthResp = jso_checkforcode();
      if (oauthResp) {
        const codeVerifier = jso_getCodeVerifier(auth.provider);

        if (codeVerifier && oauthResp.code && oauthResp.state) {
          return resolve(
            await authorizationCodeCallback(
              auth,
              codeVerifier,
              oauthResp.code,
              oauthResp.state
            )
          );
        }
      }

      // Remove this when google chrome is compatible
      // @ts-ignore
      if (document.hasStorageAccess) {
        await checkForStorageAccess(auth);
      }

      const req = jso_getAuthRequest(auth.provider, auth.scope);

      const pkce = await generatePKCE();

      req["code_challenge"] = pkce.codeChallenge;
      req["code_challenge_method"] = "S256";

      const timeout = setTimeout(() => {
        if (auth.popupMode) {
          return resolve(logInWithPopUp());
        }

        resolve(logInWithRedirect());
      }, 5000);

      async function receiveMessage(event: MessageEvent) {
        if (event.origin !== auth.authentication_url) {
          return false;
        }
        const data = event.data;

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

        return resolve(
          await authorizationCodeCallback(
            auth,
            pkce.codeVerifier,
            code,
            req.state
          )
        );
      }

      window.addEventListener("message", receiveMessage, false);

      const authUrl = encodeURL(auth.authorization, req);
      createIFrame(authUrl);
    } catch (err) {
      console.log("Error Silent refresh");
      console.log(err);
      if (auth.popupMode) {
        return logInWithPopUp();
      }
      console.log("Error In web message mode, trying redirect...");
      return logInWithRedirect();
    }
  });
};

export const logInWithPopUp = async (reset: boolean = false) => {
  if (localStorage.getItem("redirectFallBack") === "true") {
    localStorage.removeItem("redirectFallBack");
    return await logInWithRedirect();
  }

  const authConfig = getConfig();

  jso_configure({ [authConfig.provider]: authConfig }, {}, true);

  const storedToken = jso_getToken(authConfig.provider);

  if (storedToken && !reset) {
    return storedToken;
  }

  const request = jso_getAuthRequest(
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
    accessTokenStorageKey: `raw-token-${request.providerID}`,
    additionalAuthorizationParameters: {
      state: request.state || ""
    },
    afterResponse: r => {
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
    return await logInWithRedirect();
  }

  // Authentication in the popup is successfull
  // Remove all the states in the localStorage
  jso_wipeStates();

  return jso_getToken(authConfig.provider);
};

export default (token?: string, reset: boolean = false, config?: Partial<ClientConfiguration>) => {
  if (isNode && token) {
    return logInWithToken(token).catch(e => new Error(e));
  }

  if (config?.response_mode === "web_message" && config.prompt === "none") {
    return logInWithWebMessageAndPKCE(reset);
  }

  if (config?.popupMode) {
    return logInWithPopUp(reset);
  }

  return logInWithRedirect(reset);
};

