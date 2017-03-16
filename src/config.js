export const API_URL = 'https://accounts.platform.sh/api';
export const AUTHENTICATION_URL = 'https://accounts.platform.sh';

const AUTH_CONFIG_DEFAULT = {
  'client_id': 'platform@d4tobd5qpizwa.eu.platform.sh',
  scope: ['account'],
  authorization: 'https://accounts.internal.platform.sh/oauth2/authorize',
  'logout_url': 'https://accounts.internal.platform.sh/user/logout'
};

let config = {...AUTH_CONFIG_DEFAULT};

export const setAuthenticationConfig = (newConfig) => {
  config = {...config, ...newConfig};
};

export const getAuthenticationConfig = () => {
  return config;
};
