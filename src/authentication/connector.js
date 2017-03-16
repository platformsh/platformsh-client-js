import isNode from 'detect-node';

import { request } from '../api';
import { jso_configure, jso_ensureTokens, jso_getToken } from '../jso';
import { getConfig } from '../config';

const basicAuth = btoa('platform-cli:');

function logInWithToken(token) {
  const credentials = {
    grant_type: 'api_token',
    api_token: token
  };
  const headers = {
    Authorization: `Basic ${basicAuth}`
  };
  const { authentication_url } = getConfig();

  return request(`${authentication_url}/oauth2/token`, 'POST', credentials, headers)
          .then(session => session.access_token);
}

function logInWithRedirect() {
  return new Promise((resolve, reject) => {
    const auth = getConfig();

    if (!auth.client_id) {
      reject('Client_id in AUTH_CONFIG is mandatory');
    }
    // ensure that there is an access token, redirecting to auth if needed
    if (!auth.redirect_uri) {
      // Some targets just need some dynamism
      auth.redirect_uri = window.location.origin;
    }

    jso_configure({'cg': auth});
    jso_ensureTokens({'cg': auth.scope});

    const token = jso_getToken('cg');

    if(!token) {
      reject('No token found');
    }

    resolve(token);
  });
}

export default (token) => {
  if(isNode) {
    return logInWithToken(token);
  }

  return logInWithRedirect();
};
