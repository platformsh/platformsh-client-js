export default class ApiDefaultStorage {
  /**
  saveState stores an object with an Identifier.
  TODO: Ensure that both localstorage and JSON encoding has fallbacks for ancient browsers.
  In the state object, we put the request object, plus these parameters:
  * location
  * providerID
  * scopes

  */
  saveState(state, providerId, obj) {
    localStorage.setItem(`state-${providerId}-${state}`, JSON.stringify(obj));
  }

  /**
   * getStage()  returns the state object, but also removes it.
   * @type {Object}
   */
  getState(state, providerId) {
    var obj = JSON.parse(localStorage.getItem(`state-${providerId}-${state}`));

    localStorage.removeItem(`state-${providerId}-${state}`);
    return obj;
  }

  /*
  * Checks if a token, has includes a specific scope.
  * If token has no scope at all, false is returned.
  */
  hasScope(token, scope) {
    var i;

    if (!token.scopes) return false;
    for (i = 0; i < token.scopes.length; i++) {
      if (token.scopes[i] === scope) return true;
    }
    return false;
  }

  /*
  * Takes an array of tokens, and removes the ones that
  * are expired, and the ones that do not meet a scopes requirement.
  */
  filterTokens(tokens, scopes) {
    var i,
      j,
      result = [],
      now = Math.round(new Date().getTime() / 1000.0),
      usethis;

    if (!scopes) scopes = [];

    for (i = 0; i < tokens.length; i++) {
      usethis = true;

      // Filter out expired tokens. Tokens that is expired in 1 second from now.
      if (tokens[i].expires && tokens[i].expires < now + 1) usethis = false;

      // Filter out this token if not all scope requirements are met
      for (j = 0; j < scopes.length; j++) {
        if (!this.hasScope(tokens[i], scopes[j])) usethis = false;
      }

      if (usethis) result.push(tokens[i]);
    }
    return result;
  }

  /*
  * saveTokens() stores a list of tokens for a provider.

  Usually the tokens stored are a plain Access token plus:
  * expires : time that the token expires
  * providerID: the provider of the access token?
  * scopes: an array with the scopes (not string)
  */
  saveTokens(provider, tokens) {
    localStorage.setItem(`tokens-${provider}`, JSON.stringify(tokens));
  }

  getTokens(provider) {
    var tokens = JSON.parse(localStorage.getItem(`tokens-${provider}`));

    if (!tokens) tokens = [];

    return tokens;
  }

  wipeTokens(provider) {
    localStorage.removeItem(`tokens-${provider}`);
  }

  /*
  * Save a single token for a provider.
  * This also cleans up expired tokens for the same provider.
  */
  saveToken(provider, token) {
    var tokens = this.getTokens(provider);

    tokens = this.filterTokens(tokens);
    tokens.push(token);
    this.saveTokens(provider, tokens);
  }

  /*
  * Get a token if exists for a provider with a set of scopes.
  * The scopes parameter is OPTIONAL.
  */
  getToken(provider, scopes) {
    var tokens = this.getTokens(provider);

    tokens = this.filterTokens(tokens, scopes);
    if (tokens.length < 1) return null;
    return tokens[0];
  }
}
