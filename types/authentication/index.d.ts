declare function _default({ api_token, access_token, provider, popupMode, response_mode, prompt }: {
    api_token: any;
    access_token: any;
    provider?: string;
    popupMode: any;
    response_mode: any;
    prompt: any;
}, reset: any): any;
export default _default;
export const authenticatedRequest: (url: any, method: any, data: any, additionalHeaders?: {}) => any;
export const wipeToken: () => void;
