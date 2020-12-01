export function setAuthenticationPromise(promise: any): void;
export function getAuthenticationPromise(): any;
export function request(url: any, method: any, data: any, additionalHeaders?: {}): any;
export function authenticatedRequest(url: any, method: any, data: any, additionalHeaders?: {}): any;
export function createEventSource(url: any): any;
export default authenticatedRequest;
