import type {
  ClientConfiguration,
  DefaultClientConfiguration
} from "../config";

import type { TokenOAuthRedirectResponse } from "./ApiDefaultStorage";
import ApiDefaultStorage from "./ApiDefaultStorage";

export type PKCERequest = {
  codeVerifier: string;
  codeChallenge: string;
};

export type OAuthRequest = {
  code_challenge?: string;
  code_challenge_method?: string;
  scopes?: string[];
  scope?: string;
  state?: string;
  location?: string;
  providerID?: string;
} & Partial<Omit<ClientConfiguration, "scope">>;

export type CodeOAuthRedirectResponse = {
  code: string | null;
  state: string | null;
};

export type OAuthState = {
  providerID: string;
  scopes?: string[];
  location?: string;
};

let config: Record<string, ClientConfiguration>;
const options: Record<string, any> = {
  debug: false
};
// let api_redirect: (url: string) => void;
// let api_storage: ApiDefaultStorage;
const internalStates: Record<string, any> = {};

/*
 * ------ SECTION: Utilities
 */

/**
 * A log wrapper, that only logs if logging is turned on in the config
 */
const log = (msg: any) => {
  if (!options.debug) return;
  if (!console) return;
  if (!console.log) return;

  // console.log("LOG(), Arguments", arguments, msg);
  console.log(msg);
};

/*
 * Returns a random string used for state
 */
const uuid = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/gu, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;

    return v.toString(16);
  });

/**
 * Set the global options.
 */
const setOptions = (opts: Record<string, any> | undefined) => {
  if (!opts) return;
  for (const k in opts) {
    if (opts.hasOwnProperty(k)) {
      options[k] = opts[k];
    }
  }
};

/*
 * Takes an URL as input and a params object.
 * Each property in the params is added to the url as query string parameters
 */
export const encodeURL = (url: string, params: Record<string, any>) => {
  let res = url;
  let k;
  let i = 0;
  const firstSeparator = url.includes("?") ? "&" : "?";

  for (k in params) {
    if (Object.prototype.hasOwnProperty.call(params, k)) {
      res += `${
        (i++ === 0 ? firstSeparator : "&") + encodeURIComponent(k)
      }=${encodeURIComponent(params[k])}`;
    }
  }
  return res;
};

/*
 * Returns epoch, seconds since 1970.
 * Used for calculation of expire times.
 */
export const epoch = () => Math.round(new Date().getTime() / 1000.0);

const parseQueryString = (qs: string) => {
  let e;
  const r = /([^&;=]+)=?([^&;]*)/gu;
  const d = (s: string) => decodeURIComponent(s.replace(/\+/gu, " "));
  const urlParams: Record<string, any> = {};

  e = r.exec(qs);
  while (e) {
    urlParams[d(e[1])] = d(e[2]);
    e = r.exec(qs);
  }

  return urlParams;
};
/*
 * ------ / SECTION: Utilities
 */

/*
 * Redirects the user to a specific URL
 */
const api_redirect = (url: string) => {
  window.location.href = url;
};

const api_storage = new ApiDefaultStorage();

export const jso_getCodeVerifier = (provider: string) =>
  api_storage.getCodeVerifier(provider);

export const jso_saveCodeVerifier = (
  provider: string,
  codeVerifier: string
) => {
  api_storage.saveCodeVerifier(provider, codeVerifier);
};

const getTokenOauthRedirectResponse = (
  url: string | undefined
): TokenOAuthRedirectResponse | undefined => {
  let h = window.location.hash;

  // If a url is provided
  if (url) {
    if (!url.includes("#")) return;
    h = url.substring(url.indexOf("#"));
  }

  return parseQueryString(h.substring(1));
};

const getCodeOauthRedirectResponse = (
  url: string | undefined
): CodeOAuthRedirectResponse | undefined => {
  const urlParams = new URLSearchParams(
    url ? `?${url.split("?")[1]}` : window.location.search
  );
  if (!urlParams.has("code")) {
    return;
  }

  return {
    code: urlParams.get("code"),
    state: urlParams.get("state")
  };
};

export const jso_checkforcode = (url?: string) => {
  const oauthResponse = getCodeOauthRedirectResponse(url);

  if (!oauthResponse?.code) {
    return;
  }

  return oauthResponse;
};

export const set_token_expiration = (atoken: TokenOAuthRedirectResponse) => {
  const now = epoch();
  if (atoken.expires_in) {
    atoken.expires = now + parseInt(atoken.expires_in, 10);
  }

  return atoken;
};

/**
 * Check if the hash contains an access token.
 * And if it do, extract the state, compare with
 * config, and store the access token for later use.
 *
 * The url parameter is optional. Used with phonegap and
 * childbrowser when the jso context is not receiving the response,
 * instead the response is received on a child browser.
 */
export const jso_checkfortoken = (
  clientId: string,
  provider: string,
  url?: string,
  disableRedirect?: boolean
) => {
  let atoken: TokenOAuthRedirectResponse | undefined;
  let state: OAuthState;
  // let co: ClientConfiguration;

  log(`jso_checkfortoken(${clientId})`);

  atoken = getTokenOauthRedirectResponse(url);

  if (atoken?.state) {
    state = api_storage.getState(atoken.state, provider);
  } else {
    if (!clientId) {
      throw new Error(
        "Could not get [state] and no default providerid is provided."
      );
    }
    state = { providerID: clientId };

    return;
  }

  if (!state) throw new Error("Could not retrieve state");
  if (!state.providerID) throw new Error("Could not get providerid from state");
  if (!config[state.providerID])
    throw new Error("Could not retrieve config for this provider.");
  const co = config[state.providerID];

  /**
   * If state was not provided, and default provider contains a scope parameter
   * we assume this is the one requested...
   */
  if (!atoken?.state && co.scope) {
    state.scopes = co.scope;
  }

  atoken = set_token_expiration(atoken);

  /*
   * Handle scopes for this token
   */
  if (atoken?.scope) {
    atoken.scopes = atoken.scope.split(" ");
  } else if (state.scopes) {
    atoken.scopes = state.scopes;
  }

  api_storage.saveToken(state.providerID, atoken);
  if (!disableRedirect) {
    if (state.location) {
      window.location.href = state.location;
    } else {
      window.location.hash = "";
    }
  }

  if (
    atoken.state &&
    internalStates[atoken.state] &&
    typeof internalStates[atoken.state] === "function"
  ) {
    // log('InternalState is set, calling it now!');
    internalStates[atoken.state]();
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete internalStates[atoken.state];
  }
};

export const jso_getAuthRequest = (
  providerid: string,
  scopes: string[],
  response_mode?: string,
  prompt?: string
): OAuthRequest => {
  if (!config[providerid])
    throw new Error(`Could not find configuration for provider ${providerid}`);
  const co = config[providerid];

  const state = uuid();
  const request: OAuthRequest = {
    response_type: "token"
  };
  request.state = state;

  if (co.redirect_uri) {
    request.redirect_uri = co.redirect_uri;
  }
  if (co.client_id) {
    request.client_id = co.client_id;
  }
  if (scopes) {
    request.scope = scopes.join(" ");
  }
  if (co.response_mode) {
    request.response_mode = co.response_mode;
  }
  if (co.response_type) {
    request.response_type = co.response_type;
  }
  if (co.prompt) {
    request.prompt = co.prompt;
  }

  if (typeof response_mode !== "undefined") {
    request.response_mode = response_mode;
  }

  if (typeof prompt !== "undefined") {
    request.prompt = prompt;
  }

  // We'd like to cache the hash for not loosing Application state.
  // With the implciit grant flow, the hash will be replaced with the access
  // token when we return after authorization.
  request.location = window.location.href;
  request.providerID = providerid;
  if (scopes) {
    request.scopes = scopes;
  }

  log(`Saving state [${state}]`);
  log(JSON.parse(JSON.stringify(request)));

  api_storage.saveState(state, providerid, request);

  return request;
};

export const jso_getAuthUrl = (
  providerid: string,
  scopes: string[],
  codeChallenge?: string
) => {
  if (!config[providerid])
    throw new Error(`Could not find configuration for provider ${providerid}`);
  const co = config[providerid];

  const request = jso_getAuthRequest(providerid, scopes, "");

  if (codeChallenge) {
    request.code_challenge = codeChallenge;
    request.code_challenge_method = "S256";
  }

  const authurl = encodeURL(co.authorization, request);

  return authurl;
};

/*
 * A config object contains:
 */
const jso_authrequest = (
  providerid: string,
  scopes: string[],
  codeChallenge?: string
) => {
  const authurl = jso_getAuthUrl(providerid, scopes, codeChallenge);

  api_redirect(authurl);
};

export const jso_ensureTokens = (
  ensure: Record<string, any>,
  reset: boolean,
  onBeforeRedirect?: (location: string) => void,
  codeChallenge?: string
) => {
  let providerid;
  let scopes;
  let token;

  for (providerid in ensure) {
    if (Object.prototype.hasOwnProperty.call(ensure, providerid)) {
      scopes = undefined;
      if (ensure[providerid]) scopes = ensure[providerid];
      token = api_storage.getToken(providerid, scopes);

      log(`Ensure token for provider [${providerid}] `);
      log(token);

      if (token === null || reset) {
        const { location } = window;
        const uri = `${location.pathname}${location.search}${location.hash}`;
        if (onBeforeRedirect) {
          onBeforeRedirect(uri);
        } else {
          // Set the redirect URI to redirect the user when he will come back to the app after the authentication
          const redirect_uri = localStorage.getItem("auth-redirect-uri");
          if (!redirect_uri) {
            localStorage.setItem("auth-redirect-uri", uri);
          }
        }

        jso_authrequest(providerid, scopes, codeChallenge);
      }
    }
  }
  return true;
};

export const jso_configure = (
  c: Record<string, DefaultClientConfiguration>,
  opts?: Record<string, any>,
  popupMode?: boolean
) => {
  config = c;
  setOptions(opts);
  try {
    const [def] = Object.keys(c);

    if (!popupMode && def && c[def].response_type === "token") {
      jso_checkfortoken(c[def].client_id, def);
    }
  } catch (e) {
    log(`Error when retrieving token from hash: ${e}`);
    window.location.hash = "";
  }
};

export const jso_wipe = () => {
  log("jso_wipe()");
  for (const key in config) {
    if (Object.prototype.hasOwnProperty.call(config, key)) {
      log(`Wipping tokens for ${key}`);
      api_storage.wipeTokens(key);
    }
  }
};

export const jso_saveToken = (
  providerID: string,
  atoken: TokenOAuthRedirectResponse
) => {
  api_storage.saveToken(providerID, atoken);
};

export const jso_getToken = (providerid: string, scopes?: string[]) => {
  const token = api_storage.getToken(providerid, scopes);

  if (!token) return null;
  if (!token.access_token) return null;
  return token;
};

export const jso_wipeStates = () => {
  for (const key in localStorage) {
    if (key.startsWith("state-")) {
      localStorage.removeItem(key);
    }
  }
};

const base64URLEncode = (data: ArrayBuffer) =>
  btoa(String.fromCharCode.apply(null, [...new Uint8Array(data)]))
    .replace(/\+/gu, "-")
    .replace(/\//gu, "_")
    .replace(/=+$/u, "");

export const generatePKCE = async () => {
  const array = new Uint32Array(80);
  window.crypto.getRandomValues(array);
  const codeVerifier = base64URLEncode(array);

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const codeChallenge = base64URLEncode(
    await crypto.subtle.digest("SHA-256", data)
  );

  return { codeVerifier, codeChallenge };
};
