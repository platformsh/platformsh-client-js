export type TokenOAuthRedirectResponse = {
  [key: string]: any;
  expires?: number;
  scopes?: string[];
  access_token?: unknown;
  state?: string | null;
};

export class ApiDefaultStorage {
  /**
  saveState stores an object with an Identifier.
  TODO: Ensure that both localstorage and JSON encoding has fallbacks for ancient browsers.
  In the state object, we put the request object, plus these parameters:
  * location
  * providerID
  * scopes

  */
  saveState(state: string, providerId: string, obj: unknown) {
    localStorage.setItem(`state-${providerId}-${state}`, JSON.stringify(obj));
  }

  /**
   * getStage()  returns the state object, but also removes it.
   */
  getState(state: string, providerId: string) {
    const obj = JSON.parse(
      localStorage.getItem(`state-${providerId}-${state}`)!
    );

    localStorage.removeItem(`state-${providerId}-${state}`);
    return obj;
  }

  /*
   * Checks if a token, has includes a specific scope.
   * If token has no scope at all, false is returned.
   */
  hasScope(token: TokenOAuthRedirectResponse, scope: string) {
    if (!token.scopes) return false;
    for (const tokenScope of token.scopes) {
      if (tokenScope === scope) return true;
    }
    return false;
  }

  /*
   * Takes an array of tokens, and removes the ones that
   * are expired, and the ones that do not meet a scopes requirement.
   */
  filterTokens(tokens: TokenOAuthRedirectResponse[], scopes: string[] = []) {
    const result = [];
    const now = Math.round(new Date().getTime() / 1000.0);

    for (const token of tokens) {
      let usethis = true;

      // Filter out expired tokens. Tokens that is expired in 1 second from now.
      if (token.expires && token.expires < now + 1) usethis = false;

      // Filter out this token if not all scope requirements are met
      for (const scope of scopes) {
        if (!this.hasScope(token, scope)) usethis = false;
      }

      if (usethis) result.push(token);
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
  saveTokens(provider: string, tokens: TokenOAuthRedirectResponse[]) {
    localStorage.setItem(`tokens-${provider}`, JSON.stringify(tokens));
  }

  getTokens(provider: string) {
    const tokens: TokenOAuthRedirectResponse[] =
      JSON.parse(localStorage.getItem(`tokens-${provider}`)!) ?? [];

    return tokens;
  }

  wipeTokens(provider: string) {
    localStorage.removeItem(`tokens-${provider}`);
  }

  /*
   * Save a single token for a provider.
   * This also cleans up expired tokens for the same provider.
   */
  saveToken(provider: string, token: TokenOAuthRedirectResponse) {
    let tokens = this.getTokens(provider);

    tokens = this.filterTokens(tokens);
    tokens.push(token);
    this.saveTokens(provider, tokens);
  }

  /*
   * Get a token if exists for a provider with a set of scopes.
   * The scopes parameter is OPTIONAL.
   */
  getToken(provider: string, scopes?: string[]) {
    let tokens = this.getTokens(provider);

    tokens = this.filterTokens(tokens, scopes);
    if (tokens.length < 1) return null;
    return tokens[0];
  }

  saveCodeVerifier(provider: string, codeVerifier: string) {
    localStorage.setItem(`${provider}-code-verifier`, codeVerifier);
  }

  getCodeVerifier(provider: string) {
    return localStorage.getItem(`${provider}-code-verifier`);
  }
}
