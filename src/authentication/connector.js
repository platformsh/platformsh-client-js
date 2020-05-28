import isNode from "detect-node";
import { OAuth2PopupFlow } from "oauth2-popup-flow";
import "isomorphic-fetch"; // fetch api polyfill

import { request } from "../api";
import {
  jso_configure,
  jso_ensureTokens,
  jso_getToken,
  jso_getAuthUrl,
  jso_getAuthRequest,
  jso_checkfortoken,
  set_token_expiration,
  jso_wipe,
  jso_wipeStates,
  jso_saveToken,
  encodeURL,
  generatePKCE,
  epoch,
  jso_checkforcode,
  jso_saveCodeVerifier,
  jso_getCodeVerifier
} from "../jso";
import { getConfig } from "../config";

let basicAuth;

if (isNode) {
  basicAuth = Buffer.from("platform-cli:", "latin1").toString("base64");
} else {
  basicAuth = btoa("platform-cli:");
}

function createIFrame(src, options = {}) {
  let iframe = document.getElementById("logiframe-platformsh");

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

  iframe.contentWindow.onerror = function(msg, url, line) {
    if (msg === "[IFRAME ERROR MESSAGE]") {
      return true;
    }
  };

  return iframe;
}

function removeIFrame() {
  let iframe = document.getElementById("logiframe-platformsh");

  if (!iframe) {
    return false;
  }

  document.body.removeChild(iframe);
}

function logInWithToken(token) {
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
  ).then(session => {
    const expires = epoch() + session.expires_in;

    return {
      expires,
      ...session
    };
  });
}

const getTokenWithAuthorizationCode = async (
  authenticationUrl,
  clientId,
  redirectUri,
  codeVerifier,
  code
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
    return reject(resp);
  }

  return await resp.json();
};

function logInWithRedirect(reset) {
  console.log("In redirect...");
  return new Promise(async (resolve, reject) => {
    const config = getConfig();
    const auth = {
      response_mode: config.response_mode,
      prompt: config.prompt,
      ...config
    };
    let pkce;

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
        // Get token with the code
        const codeVerifier = jso_getCodeVerifier(auth.provider);

        const atoken = await getTokenWithAuthorizationCode(
          auth.authentication_url,
          auth.client_id,
          auth.redirect_uri,
          codeVerifier,
          oauthResp.code
        );

        set_token_expiration(atoken, auth);

        jso_saveToken(req.providerID, atoken);

        localStorage.removeItem(`state-${req.providerID}-${req.state}`);

        return resolve(atoken);
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
        href = iframe.contentWindow.location.href;

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
          auth.response_type === "code" && pkce.codeChallenge
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
          // Get token with the code
          const atoken = await getTokenWithAuthorizationCode(
            auth.authentication_url,
            auth.client_id,
            auth.redirect_uri,
            pkce.codeVerifier,
            oauthResp.code
          );

          set_token_expiration(atoken, auth);

          localStorage.removeItem(`state-${req.providerID}-${req.state}`);

          jso_saveToken(req.providerID, atoken);

          return resolve(atoken);
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

const logInWithWebMessageAndPKCE = async reset => {
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

      async function receiveMessage(event) {
        if (event.origin !== auth.authentication_url) {
          return false;
        }
        const data = event.data;

        if (data.error || !data.payload || data.state !== req.state) {
          throw new Error(data.error);
        }

        localStorage.removeItem(`state-${req.providerID}-${req.state}`);

        clearTimeout(timeout);

        const code = data.payload;

        const atoken = await getTokenWithAuthorizationCode(
          auth.authentication_url,
          auth.client_id,
          auth.redirect_uri,
          pkce.codeVerifier,
          code
        );

        set_token_expiration(atoken, auth);

        jso_saveToken(req.providerID, atoken);

        removeIFrame();

        return resolve(atoken);
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

export const logInWithPopUp = async reset => {
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

  const request = jso_getAuthRequest(authConfig.provider, authConfig.scope);

  const auth = new OAuth2PopupFlow({
    authorizationUri: authConfig.authorization,
    clientId: authConfig.client_id,
    redirectUri: authConfig.redirect_uri,
    scope: authConfig.scope,
    accessTokenStorageKey: `raw-token-${request.providerID}`,
    additionalAuthorizationParameters: {
      state: request.state
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

  const resp = auth.handleRedirect();

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

export default (token, reset, config) => {
  if (isNode) {
    return logInWithToken(token).catch(e => new Error(e));
  }

  if (config.response_mode === "web_message" && config.prompt === "none") {
    return logInWithWebMessageAndPKCE(reset);
  }

  if (config.popupMode) {
    return logInWithPopUp(reset);
  }

  return logInWithRedirect(reset);
};
