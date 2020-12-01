export function setConfig(newConfig: any): void;
export function getConfig(): {
    provider: string;
    client_id: string;
    account_url: string;
    api_url: string;
    authentication_url: string;
    scope: any[];
    authorization: string;
    logout_url: string;
};
