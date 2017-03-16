const DEFAULT_URL = 'https://accounts.platform.sh';

const getConfigDefault = (baseUrl = DEFAULT_URL) => ({
  'client_id': 'platform@d4tobd5qpizwa.eu.platform.sh',
  'api_url': `${baseUrl}/api`,
  'authentication_url': baseUrl,
  scope: ['account'],
  authorization: `${baseUrl}/oauth2/authorize`,
  'logout_url': `${baseUrl}/user/logout`
});

let config = getConfigDefault();

export const setConfig = (newConfig) => {
  config = {...getConfigDefault(newConfig.base_url), ...newConfig};
};

export const getConfig = () => {
  return config;
};
