const DEFAULT_ACCOUNT_URL = "https://accounts.platform.sh";
const DEFAULT_API_URL = "https://api.platform.sh/api";

export type ClientConfiguration = {
  provider: string,
  client_id: string,
  account_url: string,
  api_url: string,
  authentication_url: string,
  scope: Array<string>,
  authorization: string,
  logout_url: string,
  access_token?: string,
  api_token?: string,
  popupMode?: boolean,
  response_mode?: string,
  prompt?: boolean,
  base_url?: string
};

const getConfigDefault = (
  baseUrl: string = DEFAULT_ACCOUNT_URL,
  api_url: string = DEFAULT_API_URL
): ClientConfiguration => ({
  provider: "cg",
  client_id: "platform@d4tobd5qpizwa.eu.platform.sh",
  account_url: `${baseUrl}/api`,
  api_url,
  authentication_url: baseUrl,
  scope: [],
  authorization: `${baseUrl}/oauth2/authorize`,
  logout_url: `${baseUrl}/user/logout`
});

let config = getConfigDefault();

export const setConfig = (newConfig: ClientConfiguration) => {
  config = {
    ...getConfigDefault(newConfig.base_url, newConfig.api_url),
    ...newConfig
  };
};

export const getConfig = (): ClientConfiguration => {
  return config;
};
