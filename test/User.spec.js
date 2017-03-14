/* global after, before*/

import { assert } from 'chai';
import fetchMock from 'fetch-mock';

import { API_URL } from '../src/config';
import { setToken } from '../src/api';
import User from '../src/model/User';

describe('User', () => {
  before(function() {
    setToken('testToken');
  });

  after(function() {
    fetchMock.restore();
  });

  it('Get user', done => {
    fetchMock.mock(`${API_URL}/user/1`, {id: 1, name: 'test'});

    User.get({id: 1}).then(user => {
      assert.equal(user.id, 1);
      assert.equal(user.name, 'test');
      assert.equal(user.constructor.name, 'User');
      done();
    });
  });

  it('Get users', done => {
    const users = [{id: 1, name: 'test1'}, {id: 2, name: 'test2'}, {id: 3, name: 'test3'}, {id: 4, name: 'test4'}];

    fetchMock.mock(`${API_URL}/user`, users);

    User.query({id: [1, 2, 3, 4]}).then(users => {
      assert.equal(users.length, 4);
      assert.equal(users[0].name, 'test1');
      assert.equal(users[0].constructor.name, 'User');
      done();
    });
  });
});
