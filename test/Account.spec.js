/* global afterEach, before*/

import { assert } from 'chai';
import fetchMock from 'fetch-mock';

import { API_URL } from '../src/config';
import { setToken } from '../src/api';
import Account from '../src/model/Account';

describe('Account', () => {
  before(function() {
    setToken('testToken');
  });

  afterEach(function() {
    fetchMock.restore();
  });

  it('Get account', done => {
    fetchMock.mock(`${API_URL}/user/1`, {id: 1, email: 'test@test.com'});

    Account.get({id: 1}).then(account => {
      assert.equal(account.id, 1);
      assert.equal(account.email, 'test@test.com');
      assert.equal(account.constructor.name, 'Account');
      done();
    });
  });

  it('Get accounts', done => {
    const accounts = [
      {id: 1, email: 'test1'},
      {id: 2, email: 'test2'},
      {id: 3, email: 'test3'},
      {id: 4, email: 'test4'}
    ];

    fetchMock.mock(`${API_URL}/user?id%5B%5D=1&id%5B%5D=2&id%5B%5D=3&id%5B%5D=4`, accounts);

    Account.query({id: [1, 2, 3, 4]}).then(accounts => {
      assert.equal(accounts.length, 4);
      assert.equal(accounts[0].email, 'test1');
      assert.equal(accounts[0].constructor.name, 'Account');
      done();
    });
  });
});
