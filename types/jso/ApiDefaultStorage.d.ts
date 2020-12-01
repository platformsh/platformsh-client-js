export default class ApiDefaultStorage {
    /**
    saveState stores an object with an Identifier.
    TODO: Ensure that both localstorage and JSON encoding has fallbacks for ancient browsers.
    In the state object, we put the request object, plus these parameters:
    * location
    * providerID
    * scopes
  
    */
    saveState(state: any, providerId: any, obj: any): void;
    /**
     * getStage()  returns the state object, but also removes it.
     * @type {Object}
     */
    getState(state: any, providerId: any): any;
    hasScope(token: any, scope: any): boolean;
    filterTokens(tokens: any, scopes: any): any[];
    saveTokens(provider: any, tokens: any): void;
    getTokens(provider: any): any;
    wipeTokens(provider: any): void;
    saveToken(provider: any, token: any): void;
    getToken(provider: any, scopes: any): any;
    saveCodeVerifier(provider: any, codeVerifier: any): void;
    getCodeVerifier(provider: any): string;
}
