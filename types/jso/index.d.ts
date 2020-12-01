export function encodeURL(url: any, params: any): any;
export function epoch(): number;
export function jso_getCodeVerifier(provider: any): any;
export function jso_saveCodeVerifier(provider: any, codeVerifier: any): void;
export function set_token_expiration(atoken: any, co: any): any;
export function jso_checkforcode(url: any): false | {
    code: string;
    state: string;
};
export function jso_checkfortoken(clientId: any, provider: any, url: any, disableRedirect: any): void;
export function jso_getAuthUrl(providerid: any, scopes: any, codeChallenge: any): any;
export function jso_getAuthRequest(providerid: any, scopes: any, response_mode: any, prompt: any): {
    response_type: string;
};
export function jso_ensureTokens(ensure: any, reset: any, onBeforeRedirect: any, codeChallenge: any): boolean;
export function jso_findDefaultEntry(c: any): string;
export function jso_configure(c: any, opts: any, popupMode: any): void;
export function jso_dump(): void;
export function jso_wipe(): void;
export function jso_saveToken(providerID: any, atoken: any): void;
export function jso_getToken(providerid: any, scopes: any): any;
export function jso_registerRedirectHandler(callback: any): void;
export function jso_registerStorageHandler(object: any): void;
export function jso_wipeStates(): void;
export function generatePKCE(): Promise<{
    codeVerifier: string;
    codeChallenge: string;
}>;
