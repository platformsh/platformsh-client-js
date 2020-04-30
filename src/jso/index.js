import ApiDefaultStorage from "./ApiDefaultStorage";

let config = {},
  default_lifetime = 3600,
  options = {
    debug: false
  },
  api_redirect,
  api_storage,
  internalStates = [];

/*
* ------ SECTION: Utilities
*/

/**
 * A log wrapper, that only logs if logging is turned on in the config
 * @param  {string} msg Log message
 */
const log = msg => {
  if (!options.debug) return;
  if (!console) return;
  if (!console.log) return;

  // console.log('LOG(), Arguments', arguments, msg)
  if (arguments.length > 1) {
    console.log(arguments);
  } else {
    console.log(msg);
  }
};

/*
* Returns a random string used for state
*/
const uuid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;

    return v.toString(16);
  });
};

/**
 * Set the global options.
 */
const setOptions = opts => {
  if (!opts) return;
  for (let k in opts) {
    if (opts.hasOwnProperty(k)) {
      options[k] = opts[k];
    }
  }
  log("Options is set to ", options);
};

/*
* Takes an URL as input and a params object.
* Each property in the params is added to the url as query string parameters
*/
const encodeURL = (url, params) => {
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

const parseQueryString = qs => {
  let e,
    a = /\+/g, // Regex for replacing addition symbol with a space
    r = /([^&;=]+)=?([^&;]*)/g,
    d = s => decodeURIComponent(s.replace(a, " ")),
    q = qs,
    urlParams = {};

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
  window.location = url;
};

api_storage = new ApiDefaultStorage();

/**
 * Check if the hash contains an access token.
 * And if it do, extract the state, compare with
 * config, and store the access token for later use.
 *
 * The url parameter is optional. Used with phonegap and
 * childbrowser when the jso context is not receiving the response,
 * instead the response is received on a child browser.
 */
export const jso_checkfortoken = (providerID, url, disableRedirect) => {
  let atoken,
    h = window.location.hash,
    now = epoch(),
    state,
    co;

  log(`jso_checkfortoken(${providerID})`);

  // If a url is provided
  if (url) {
    // log('Hah, I got the url and it ' + url);
    if (url.indexOf("#") === -1) return;
    h = url.substring(url.indexOf("#"));
    // log('Hah, I got the hash and it is ' +  h);
  }

  /*
  * Start with checking if there is a token in the hash
  */
  if (h.length < 2) return;
  if (h.indexOf("access_token") === -1) return;
  h = h.substring(1);
  atoken = parseQueryString(h);

  if (atoken.state) {
    state = api_storage.getState(atoken.state);
  } else {
    if (!providerID) {
      throw new Error(
        "Could not get [state] and no default providerid is provided."
      );
    }
    state = { providerID: providerID };
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
  if (!atoken.state && co.scope) {
    state.scopes = co.scope;
    log("Setting state: ", state);
  }
  log(`Checking atoken ${atoken} and co `, co);

  /*
  * Decide when this token should expire.
  * Priority fallback:
  * 1. Access token expires_in
  * 2. Life time in config (may be false = permanent...)
  * 3. Specific permanent scope.
  * 4. Default library lifetime:
  */
  if (atoken["expires_in"]) {
    atoken["expires"] = now + parseInt(atoken["expires_in"], 10);
  } else if (co["default_lifetime"] === false) {
    // Token is permanent.
  } else if (co["default_lifetime"]) {
    atoken["expires"] = now + co["default_lifetime"];
  } else if (co["permanent_scope"]) {
    if (!api_storage.hasScope(atoken, co["permanent_scope"])) {
      atoken["expires"] = now + default_lifetime;
    }
  } else {
    atoken["expires"] = now + default_lifetime;
  }

  /*
  * Handle scopes for this token
  */
  if (atoken["scope"]) {
    atoken["scopes"] = atoken["scope"].split(" ");
  } else if (state["scopes"]) {
    atoken["scopes"] = state["scopes"];
  }

  api_storage.saveToken(state.providerID, atoken);
  if (!disableRedirect) {
    if (state.location) {
      window.location = state.location;
    } else {
      window.location.hash = "";
    }
  }

  log(atoken);

  if (
    internalStates[atoken.state] &&
    typeof internalStates[atoken.state] === "function"
  ) {
    // log('InternalState is set, calling it now!');
    internalStates[atoken.state]();
    delete internalStates[atoken.state];
  }

  // log(atoken);
};

export const jso_getAuthUrl = (providerid, scopes, callback) => {
  let state, request, authurl, co;

  if (!config[providerid])
    throw new Error(`Could not find configuration for provider ${providerid}`);
  co = config[providerid];

  log(`About to send an authorization request to [${providerid}]. Config:`);
  log(co);

  state = uuid();
  request = {
    response_type: "token"
  };
  request.state = state;

  if (callback && typeof callback === "function") {
    internalStates[state] = callback;
  }

  if (co["redirect_uri"]) {
    request["redirect_uri"] = co["redirect_uri"];
  }
  if (co["client_id"]) {
    request["client_id"] = co["client_id"];
  }
  if (scopes) {
    request["scope"] = scopes.join(" ");
  }

  authurl = encodeURL(co.authorization, request);

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

  api_storage.saveState(state, request);

  return authurl;
};

/*
* A config object contains:
*/
const jso_authrequest = (providerid, scopes, callback) => {
  let state, request, authurl, co;

  if (!config[providerid])
    throw new Error(`Could not find configuration for provider ${providerid}`);
  co = config[providerid];

  log(`About to send an authorization request to [${providerid}]. Config:`);
  log(co);

  state = uuid();
  request = {
    response_type: "token"
  };
  request.state = state;

  if (callback && typeof callback === "function") {
    internalStates[state] = callback;
  }

  if (co["redirect_uri"]) {
    request["redirect_uri"] = co["redirect_uri"];
  }
  if (co["client_id"]) {
    request["client_id"] = co["client_id"];
  }
  if (scopes) {
    request["scope"] = scopes.join(" ");
  }

  authurl = encodeURL(co.authorization, request);

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

  api_storage.saveState(state, request);
  api_redirect(authurl);
};

export const jso_ensureTokens = (ensure, reset) => {
  let providerid, scopes, token;

  for (providerid in ensure) {
    scopes = undefined;
    if (ensure[providerid]) scopes = ensure[providerid];
    token = api_storage.getToken(providerid, scopes);

    log("Ensure token for provider [" + providerid + "] ");
    log(token);

    if (token === null || reset) {
      // Set the redirect URI to redirect the user when he will come back to the app after the authentication
      const redirect_uri = localStorage.getItem("auth-redirect-uri");
      const location = window.location;
      const uri = `${location.pathname}${location.search}${location.hash}`;
      if (!redirect_uri) {
        localStorage.setItem("auth-redirect-uri", uri);
      }

      jso_authrequest(providerid, scopes);
    }
  }
  return true;
};

export const jso_findDefaultEntry = c => {
  let k,
    i = 0;

  if (!c) return;
  log("c", c);
  for (k in c) {
    i++;
    if (c[k].isDefault && c[k].isDefault === true) {
      return k;
    }
  }
  if (i === 1) return k;
};

export const jso_configure = (c, opts) => {
  config = c;
  setOptions(opts);
  try {
    let def = jso_findDefaultEntry(c);

    log("jso_configure() about to check for token for this entry", def);
    jso_checkfortoken(def);
  } catch (e) {
    log("Error when retrieving token from hash: " + e);
    window.location.hash = "";
  }
};

export const jso_dump = () => {
  for (let key in config) {
    log("=====> Processing provider [" + key + "]");
    log("=] Config");
    log(config[key]);
    log("=] Tokens");
    log(api_storage.getTokens(key));
  }
};

export const jso_wipe = () => {
  log("jso_wipe()");
  for (let key in config) {
    log("Wipping tokens for " + key);
    api_storage.wipeTokens(key);
  }
};

export const jso_getToken = (providerid, scopes) => {
  let token = api_storage.getToken(providerid, scopes);

  if (!token) return null;
  if (!token["access_token"]) return null;
  return token;
};

export const jso_registerRedirectHandler = callback => {
  api_redirect = callback;
};

export const jso_registerStorageHandler = object => {
  api_storage = object;
};
