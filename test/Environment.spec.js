/* global afterEach, before*/

import { assert } from 'chai';
import fetchMock from 'fetch-mock';

import { setToken } from '../src/api';
import Environment from '../src/model/Environment';

describe('Environment', () => {
  before(function() {
    setToken('testToken');
  });

  afterEach(function() {
    fetchMock.restore();
  });

  it('Get environments', done => {
    fetchMock.mock('https://api.platform.sh/api/projects/ffzefzef3/environments', [{
      id: 1,
      name: 'thevar'
    }]);

    Environment.query({
      projectId: 'ffzefzef3'
    }).then(environment => {
      assert.equal(environment.length, 1);
      assert.equal(environment[0].id, 1);
      done();
    });
  });

  it('Get environment', done => {
    fetchMock.mock('https://api.platform.sh/api/projects/ffzefzef3/environments/1', {
      id: 1,
      name: 'thevar'
    });

    Environment.get({
      projectId: 'ffzefzef3',
      id: '1'
    }).then(environment => {
      assert.equal(environment.id, 1);
      done();
    });
  });

  it('Get users associated with a project', done => {
    fetchMock.mock('https://test.com/api/projects/ffzefzef3/environments/1/variables/1', {
      id: 1,
      name: 'thevar'
    });
    const environment = new Environment({
      _links: {
        '#manage-variables': {
          href: '/api/projects/ffzefzef3/environments/1/variables'
        }
      },
      id: 1
    }, 'https://test.com/api/projects/ffzefzef3/environments');

    environment.getVariable(1).then(variable => {
      assert.equal(variable.id, 1);
      done();
    });
  });

  it('Delete environment', done => {
    fetchMock.mock('https://test.com/api/projects/ffzefzef3/environments/1', {}, 'DELETE');
    const environment = new Environment({
      _links: {
        '#manage-variables': {
          href: '/api/projects/ffzefzef3/environments/1/variables'
        },
        '#delete': {
          href: '/api/projects/ffzefzef3/environments/1'
        }
      },
      id: 1,
      status: 'inactive'
    }, 'https://test.com/api/projects/ffzefzef3/environments/1');

    environment.delete().then(() => {
      done();
    });
  });

  it('Get metrics', done => {
    fetchMock.mock('https://test.com/api/projects/ffzefzef3/environments/metrics', {
      results: {}
    });

    const environment = new Environment({
      _links: {
        self: {
          href: 'https://test.com/api/projects/ffzefzef3/environments'
        }
      },
      id: 1
    }, 'https://test.com/api/projects/ffzefzef3/environments');

    environment.getMetrics().then(metrics => {
      assert.isNotNull(metrics.results);
      done();
    });
  });
});
