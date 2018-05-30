import isNode from "detect-node";
import "isomorphic-fetch"; // fetch api polyfill

import { request } from "../api";
import {
  jso_configure,
  jso_ensureTokens,
  jso_getToken,
  jso_getAuthUrl,
  jso_checkfortoken,
  jso_wipe
} from "../jso";
import { getConfig } from "../config";

let basicAuth;

if (isNode) {
  basicAuth = Buffer.from("platform-cli:", "latin1").toString("base64");
} else {
  basicAuth = btoa("platform-cli:");
}

function createIFrame(src) {
  let iframe = document.getElementById("logiframe-platformsh");

  if (iframe) {
    return iframe;
  }

  iframe = document.createElement("iframe");

  iframe.id = "logiframe-platformsh";
  iframe.style.display = "none";
  iframe.setAttribute("sandbox", "allow-same-origin");
  iframe.src = src;
  document.body.appendChild(iframe);

  iframe.contentWindow.onerror = function(msg, url, line) {
    console.log("MSG");
    console.log(msg);
    console.log(url);
    console.log(line);
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
  ).then(session => session.access_token);
}

function logInWithRedirect(reset) {
  return new Promise((resolve, reject) => {
    const auth = getConfig();

    if (!auth.client_id) {
      reject("Client_id in AUTH_CONFIG is mandatory");
    }
    // ensure that there is an access token, redirecting to auth if needed
    if (!auth.redirect_uri) {
      // Some targets just need some dynamism
      auth.redirect_uri = window.location.origin;
    }

    jso_configure({ cg: auth });
    const storedToken = jso_getToken("cg");

    if (storedToken && !reset) {
      return resolve(storedToken);
    }

    jso_wipe();

    const iframe = createIFrame(jso_getAuthUrl("cg", auth.scope));
    let attempt = 0;

    const listener = setInterval(function() {
      let href;

      try {
        href = iframe.contentWindow.location.href;
      } catch (err) {
        if (attempt < 5) {
          attempt++;
          return false;
        }

        clearInterval(listener);
        removeIFrame();
        return jso_ensureTokens({ cg: auth.scope }, true);
      }

      if (href && href.indexOf("access_token") !== -1) {
        clearInterval(listener);
        jso_checkfortoken(auth.client_id, href, true);
        const token = jso_getToken("cg");
        removeIFrame();
        resolve(token);
      }
    }, 1000);
  });
}

export default (token, reset) => {
  if (isNode) {
    return logInWithToken(token);
  }

  return logInWithRedirect(reset);
};
