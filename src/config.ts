const DEFAULT_ACCOUNT_URL = "https://accounts.platform.sh";
const DEFAULT_API_URL = "https://api.platform.sh/api";

export type ClientConfiguration = {
  provider?: string;
  client_id?: string;
  account_url?: string;
  api_url: string;
  authentication_url?: string;
  scope?: string[];
  authorization: string;
  logout_url?: string;
  access_token?: string;
  api_token?: string;
  popupMode?: boolean;
  response_mode?: string;
  prompt?: string;
  base_url?: string;
  redirect_uri?: string;
  response_type?: string;
  onBeforeRedirect?: (location: string) => void;
  ignoredSubdirectories?: string[];
  extra_params?: Record<string, string>;
  // @return a boolean indicating whether the client should retry the request,
  // including the www-authenticate header content.
  hold401Responses?: (httpresponse: Response) => Promise<boolean>;
};

export type DefaultClientConfiguration = ClientConfiguration & {
  scope: string[];
  redirect_uri: string;
  provider: string;
  client_id: string;
  account_url: string;
  authentication_url: string;
  prompt: string;
  response_type: string;
};

const getConfigDefault = (
  baseUrl: string = DEFAULT_ACCOUNT_URL,
  api_url: string = DEFAULT_API_URL
): DefaultClientConfiguration => ({
  provider: "cg",
  client_id: "platform@d4tobd5qpizwa.eu.platform.sh",
  // On development environment, "baseUrl" already has "/api" appended and this is required.
  account_url: `${baseUrl.replace(/(\/api\/?)$/u, "")}/api`,
  api_url,
  authentication_url: baseUrl,
  scope: [],
  authorization: `${baseUrl}/oauth2/authorize`,
  logout_url: `${baseUrl}/user/logout`,
  prompt: "",
  redirect_uri: "",
  response_type: "code",
  ignoredSubdirectories: []
});

let config = getConfigDefault();

export const setConfig = (newConfig: ClientConfiguration) => {
  config = {
    ...getConfigDefault(newConfig.base_url, newConfig.api_url),
    ...newConfig
  };
};

export const getConfig = () => config;
