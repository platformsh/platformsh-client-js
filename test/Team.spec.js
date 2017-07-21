/* global afterEach, before*/

import { assert } from 'chai';
import fetchMock from 'fetch-mock';

import { setToken } from '../src/api';
import Team from '../src/model/Team';

describe('Team', () => {
  before(function() {
    setToken('testToken');
  });

  afterEach(function() {
    fetchMock.restore();
  });

  it('Get members', done => {
    fetchMock.mock('https://api.platform.sh/api/platform/teams/1/members', [{user: '1'}]);

    const team = new Team({id: 1});

    team.getMembers().then(teamMembers => {
      assert.equal(teamMembers[0].user, '1');
      assert.equal(teamMembers[0].constructor.name, 'TeamMember');
      done();
    });
  });
});
