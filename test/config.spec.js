import { assert } from 'chai';

import { setAuthenticationConfig, getAuthenticationConfig } from '../src/config';

describe('Configuration', () => {
  it('Override the authentication configuration', () => {
    let config = getAuthenticationConfig();

    assert.equal(config.client_id, 'platform@d4tobd5qpizwa.eu.platform.sh');

    setAuthenticationConfig({
      client_id: 'test'
    });
    config = getAuthenticationConfig();
    assert.equal(config.client_id, 'test');
  });
});
