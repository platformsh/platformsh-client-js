import { JWTToken } from "src/authentication";
import { ClientConfiguration, DefaultClientConfiguration } from "src/config";
import { Token } from "typescript";
import ApiDefaultStorage from "./ApiDefaultStorage";

export type PKCERequest = {
  codeVerifier: string;
  codeChallenge: string;
};

export type OAuthRequest = {
  code_challenge?: string;
  code_challenge_method?: string;
  scopes?: Array<string>;
  scope?: string;
  state?: string;
  location?: string;
  providerID?: string;
} & Partial<Omit<ClientConfiguration, "scope">>;

export type CodeOAuthRedirectResponse = {
  code: string | null;
  state: string | null;
};

export type TokenOAuthRedirectResponse = {
  [key: string]: any;
  state?: string | null;
};

export type OAuthState = {
  providerID: string;
  scopes?: Array<string>;
  location?: string;
};

let config: Record<string, ClientConfiguration>,
  options: Record<string, any> = {
    debug: false
  },
  api_redirect: (url: string) => void,
  api_storage: ApiDefaultStorage,
  internalStates: Record<string, any> = {};

/*
 * ------ SECTION: Utilities
 */

/**
 * A log wrapper, that only logs if logging is turned on in the config
 * @param  {string} msg Log message
 */
const log = (msg: string) => {
  if (!options.debug) return;
  if (!console) return;
  if (!console.log) return;

  // console.log("LOG(), Arguments", arguments, msg);
  console.log(msg);
};

/*
 * Returns a random string used for state
 */
const uuid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;

    return v.toString(16);
  });
};

/**
 * Set the global options.
 */
const setOptions = (opts: Record<string, any> | undefined) => {
  if (!opts) return;
  for (let k in opts) {
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
  let k,
    i = 0;
  const firstSeparator = url.indexOf("?") === -1 ? "?" : "&";

  for (k in params) {
    res +=
      (i++ === 0 ? firstSeparator : "&") +
      encodeURIComponent(k) +
      "=" +
      encodeURIComponent(params[k]);
  }
  return res;
};

/*
 * Returns epoch, seconds since 1970.
 * Used for calculation of expire times.
 */
export const epoch = () => Math.round(new Date().getTime() / 1000.0);

const parseQueryString = (qs: string) => {
  let e,
    a = /\+/g, // Regex for replacing addition symbol with a space
    r = /([^&;=]+)=?([^&;]*)/g,
    d = (s: string) => decodeURIComponent(s.replace(a, " ")),
    q = qs,
    urlParams: Record<string, any> = {};

  e = r.exec(q);
  while (e) {
    urlParams[d(e[1])] = d(e[2]);
    e = r.exec(q);
  }

  return urlParams;
};
/*
 * ------ / SECTION: Utilities
 */

/*
 * Redirects the user to a specific URL
 */
api_redirect = url => {
  window.location.href = url;
};

api_storage = new ApiDefaultStorage();

export const jso_getCodeVerifier = (provider: string) => {
  return api_storage.getCodeVerifier(provider);
};

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
    if (url.indexOf("#") === -1) return;
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

export const set_token_expiration = (
  atoken: TokenOAuthRedirectResponse,
  co: ClientConfiguration
) => {
  const now = epoch();
  if (atoken["expires_in"]) {
    atoken["expires"] = now + parseInt(atoken["expires_in"], 10);
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
  let atoken: TokenOAuthRedirectResponse | undefined,
    state: OAuthState,
    co: ClientConfiguration;

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
  co = config[state.providerID];

  /**
   * If state was not provided, and default provider contains a scope parameter
   * we assume this is the one requested...
   */
  if (!atoken?.state && co.scope) {
    state.scopes = co.scope;
  }

  atoken = set_token_expiration(atoken, co);

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
    delete internalStates[atoken.state];
  }
};

export const jso_getAuthUrl = (
  providerid: string,
  scopes: Array<string>,
  codeChallenge?: string
) => {
  let request: OAuthRequest, authurl, co;
  if (!config[providerid])
    throw new Error(`Could not find configuration for provider ${providerid}`);
  co = config[providerid];

  request = jso_getAuthRequest(providerid, scopes, "");

  if (codeChallenge) {
    request["code_challenge"] = codeChallenge;
    request["code_challenge_method"] = "S256";
  }

  authurl = encodeURL(co.authorization, request);

  return authurl;
};

export const jso_getAuthRequest = (
  providerid: string,
  scopes: Array<string>,
  response_mode?: string,
  prompt?: string
): OAuthRequest => {
  let state, request: OAuthRequest, co;

  if (!config[providerid])
    throw new Error(`Could not find configuration for provider ${providerid}`);
  co = config[providerid];

  state = uuid();
  request = {
    response_type: "token"
  };
  request.state = state;

  if (co["redirect_uri"]) {
    request["redirect_uri"] = co["redirect_uri"];
  }
  if (co["client_id"]) {
    request["client_id"] = co["client_id"];
  }
  if (scopes) {
    request["scope"] = scopes.join(" ");
  }
  if (co["response_mode"]) {
    request["response_mode"] = co["response_mode"];
  }
  if (co["response_type"]) {
    request["response_type"] = co["response_type"];
  }
  if (co["prompt"]) {
    request["prompt"] = co["prompt"];
  }

  if (response_mode !== undefined) {
    request["response_mode"] = response_mode;
  }

  if (prompt !== undefined) {
    request["prompt"] = prompt;
  }

  // We'd like to cache the hash for not loosing Application state.
  // With the implciit grant flow, the hash will be replaced with the access
  // token when we return after authorization.
  request["location"] = window.location.href;
  request["providerID"] = providerid;
  if (scopes) {
    request["scopes"] = scopes;
  }

  log(`Saving state [${state}]`);
  log(JSON.parse(JSON.stringify(request)));

  api_storage.saveState(state, providerid, request);

  return request;
};

/*
 * A config object contains:
 */
const jso_authrequest = (
  providerid: string,
  scopes: Array<string>,
  codeChallenge?: string
) => {
  let authurl: string;

  authurl = jso_getAuthUrl(providerid, scopes, codeChallenge);

  api_redirect(authurl);
};

export const jso_ensureTokens = (
  ensure: Record<string, any>,
  reset: boolean,
  onBeforeRedirect?: (location: string) => void,
  codeChallenge?: string
) => {
  let providerid, scopes, token;

  for (providerid in ensure) {
    scopes = undefined;
    if (ensure[providerid]) scopes = ensure[providerid];
    token = api_storage.getToken(providerid, scopes);

    log("Ensure token for provider [" + providerid + "] ");
    log(token);

    if (token === null || reset) {
      const location = window.location;
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
    let def = Object.keys(c)[0];

    if (!popupMode && def && c[def].response_type === "token") {
      jso_checkfortoken(c[def].client_id, def);
    }
  } catch (e) {
    log("Error when retrieving token from hash: " + e);
    window.location.hash = "";
  }
};

export const jso_wipe = () => {
  log("jso_wipe()");
  for (let key in config) {
    log("Wipping tokens for " + key);
    api_storage.wipeTokens(key);
  }
};

export const jso_saveToken = (
  providerID: string,
  atoken: TokenOAuthRedirectResponse
) => {
  api_storage.saveToken(providerID, atoken);
};

export const jso_getToken = (providerid: string, scopes?: Array<string>) => {
  let token = api_storage.getToken(providerid, scopes);

  if (!token) return null;
  if (!token["access_token"]) return null;
  return token;
};

export const jso_wipeStates = () => {
  for (var key in localStorage) {
    if (key.startsWith("state-")) {
      localStorage.removeItem(key);
    }
  }
};

const base64URLEncode = (data: ArrayBuffer) => {
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(data)]))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

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
