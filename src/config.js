const DEFAULT_ACCOUNT_URL = "https://accounts.platform.sh";
const DEFAULT_API_URL = "https://api.platform.sh/api";

const getConfigDefault = (
  baseUrl = DEFAULT_ACCOUNT_URL,
  api_url = DEFAULT_API_URL
) => ({
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

export const setConfig = newConfig => {
  config = {
    ...getConfigDefault(newConfig.base_url, newConfig.api_url),
    ...newConfig
  };
};

export const getConfig = () => {
  return config;
};
