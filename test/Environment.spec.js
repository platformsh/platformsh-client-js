/* global afterEach, before*/

import { assert } from 'chai';
import fetchMock from 'fetch-mock';

import { setAuthenticationPromise } from '../src/api';
import Environment from '../src/model/Environment';

describe('Environment', () => {
  before(function() {
    setAuthenticationPromise(Promise.resolve('testToken'));
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

  it('Get variable', done => {
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

  it('Set variable with error', done => {
    fetchMock.mock('https://test.com/api/projects/ffzefzef3/environments/1/variables', JSON.stringify({
      'message': 'The server could not comply with the request since it is either malformed or otherwise incorrect.',
      'code': '400',
      'status': 400,
      'detail': {
        'name': 'String does not match expected pattern'
      },
      'title': 'Bad Request'
    }), 'POST');

    fetchMock.mock('https://test.com/api/projects/ffzefzef3/environments/1/variables/a', {});
    const environment = new Environment({
      _links: {
        '#manage-variables': {
          href: '/api/projects/ffzefzef3/environments/1/variables'
        }
      },
      id: 1
    }, 'https://test.com/api/projects/ffzefzef3/environments');

    environment.setVariable('a', 'b', false).then(result => {
      assert.equal(result.data.code, 400);
      assert.equal(result.data.detail.name, 'String does not match expected pattern');
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

  it('Activate environment', done => {
    fetchMock.mock('https://test.com/api/projects/ffzefzef3/environments/1/activate', {
      '_embedded': {
        'activities': [
          {
            'id': 'kwfj7emjcltpm',
            '_links': {
              'self': {
                'href': 'https://admin.local.c-g.io/api/projects/test_project/activities/kwfj7emjcltpm',
                'meta': {
                  'get': {
                    'responses': {
                      'default': {
                        'schema': {
                          'properties': {
                            'created_at': {
                              'type': 'string',
                              'format': 'date-time'
                            },
                            'updated_at': {
                              'type': 'string',
                              'format': 'date-time'
                            },
                            'type': {
                              'type': 'string'
                            },
                            'parameters': {
                              'properties': {},
                              'required': []
                            },
                            'project': {
                              'type': 'string'
                            },
                            'environments': {
                              'items': {
                                'type': 'string'
                              },
                              'type': 'array'
                            },
                            'state': {
                              'type': 'string'
                            },
                            'result': {
                              'type': 'string'
                            },
                            'started_at': {
                              'type': 'string',
                              'format': 'date-time'
                            },
                            'completed_at': {
                              'type': 'string',
                              'format': 'date-time'
                            },
                            'completion_percent': {
                              'type': 'integer'
                            },
                            'log': {
                              'type': 'string'
                            },
                            'payload': {
                              'properties': {},
                              'required': []
                            }
                          },
                          'required': [
                            'created_at',
                            'updated_at',
                            'type',
                            'parameters',
                            'project',
                            'environments',
                            'state',
                            'result',
                            'started_at',
                            'completed_at',
                            'completion_percent',
                            'log',
                            'payload'
                          ]
                        }
                      }
                    },
                    'parameters': []
                  }
                }
              }
            },
            'created_at': '2017-11-09T14:55:11.100839+00:00',
            'updated_at': '2017-11-09T14:55:11.100865+00:00',
            'type': 'environment.activate',
            'parameters': {
              'environment': 'fggfdgdazdazda',
              'user': 'alice'
            },
            'project': 'test_project',
            'environments': [
              'fggfdgdazdazda'
            ],
            'state': 'pending',
            'result': null,
            'started_at': null,
            'completed_at': null,
            'completion_percent': 0,
            'log': '',
            'payload': {
              'environment': {
                'id': 'fggfdgdazdazda',
                'created_at': '2017-11-08T09:02:19.358340+00:00',
                'updated_at': '2017-11-09T14:55:10.964452+00:00',
                'name': 'fggfdgdazdazda',
                'machine_name': 'fggfdgdazdazda-lgddxiq',
                'title': 'fggfdgdazdazda2',
                'parent': 'azdazdazd',
                'clone_parent_on_create': true,
                'deployment_target': 'local',
                'status': 'active',
                'http_access': {
                  'is_enabled': true,
                  'addresses': [],
                  'basic_auth': {}
                },
                'enable_smtp': false,
                'restrict_robots': true,
                'project': 'test_project',
                'is_main': false,
                'is_dirty': false,
                'has_code': true,
                'head_commit': '3a941b70a802c16f3f855680001a0713537f9ea2'
              },
              'user': {
                'id': 'alice',
                'created_at': '2013-04-18T15:19:04+00:00',
                'updated_at': '2013-04-18T15:19:04+00:00',
                'display_name': 'Alice'
              }
            }
          }
        ]
      }
    }, 'POST');
    const environment = new Environment({
      _links: {
        'self': {
          href: '/api/projects/ffzefzef3/environments/1'
        },
        '#manage-variables': {
          href: '/api/projects/ffzefzef3/environments/1/variables'
        },
        '#activate': {
          href: '/api/projects/ffzefzef3/environments/1/activate'
        }
      },
      id: 1,
      status: 'inactive'
    }, 'https://test.com/api/projects/ffzefzef3/environments/1');

    environment.activate().then(() => {
      done();
    });
  });

  it('Deactivate environment', done => {
    fetchMock.mock('https://test.com/api/projects/ffzefzef3/environments/1/deactivate', {
      '_embedded': {
        'activities': [
          {
            'id': 'kwfj7emjcltpm',
            '_links': {
              'self': {
                'href': 'https://admin.local.c-g.io/api/projects/test_project/activities/kwfj7emjcltpm',
                'meta': {
                  'get': {
                    'responses': {
                      'default': {
                        'schema': {
                          'properties': {
                            'created_at': {
                              'type': 'string',
                              'format': 'date-time'
                            },
                            'updated_at': {
                              'type': 'string',
                              'format': 'date-time'
                            },
                            'type': {
                              'type': 'string'
                            },
                            'parameters': {
                              'properties': {},
                              'required': []
                            },
                            'project': {
                              'type': 'string'
                            },
                            'environments': {
                              'items': {
                                'type': 'string'
                              },
                              'type': 'array'
                            },
                            'state': {
                              'type': 'string'
                            },
                            'result': {
                              'type': 'string'
                            },
                            'started_at': {
                              'type': 'string',
                              'format': 'date-time'
                            },
                            'completed_at': {
                              'type': 'string',
                              'format': 'date-time'
                            },
                            'completion_percent': {
                              'type': 'integer'
                            },
                            'log': {
                              'type': 'string'
                            },
                            'payload': {
                              'properties': {},
                              'required': []
                            }
                          },
                          'required': [
                            'created_at',
                            'updated_at',
                            'type',
                            'parameters',
                            'project',
                            'environments',
                            'state',
                            'result',
                            'started_at',
                            'completed_at',
                            'completion_percent',
                            'log',
                            'payload'
                          ]
                        }
                      }
                    },
                    'parameters': []
                  }
                }
              }
            },
            'created_at': '2017-11-09T14:55:11.100839+00:00',
            'updated_at': '2017-11-09T14:55:11.100865+00:00',
            'type': 'environment.activate',
            'parameters': {
              'environment': 'fggfdgdazdazda',
              'user': 'alice'
            },
            'project': 'test_project',
            'environments': [
              'fggfdgdazdazda'
            ],
            'state': 'pending',
            'result': null,
            'started_at': null,
            'completed_at': null,
            'completion_percent': 0,
            'log': '',
            'payload': {
              'environment': {
                'id': 'fggfdgdazdazda',
                'created_at': '2017-11-08T09:02:19.358340+00:00',
                'updated_at': '2017-11-09T14:55:10.964452+00:00',
                'name': 'fggfdgdazdazda',
                'machine_name': 'fggfdgdazdazda-lgddxiq',
                'title': 'fggfdgdazdazda2',
                'parent': 'azdazdazd',
                'clone_parent_on_create': true,
                'deployment_target': 'local',
                'status': 'inactive',
                'http_access': {
                  'is_enabled': true,
                  'addresses': [],
                  'basic_auth': {}
                },
                'enable_smtp': false,
                'restrict_robots': true,
                'project': 'test_project',
                'is_main': false,
                'is_dirty': false,
                'has_code': true,
                'head_commit': '3a941b70a802c16f3f855680001a0713537f9ea2'
              },
              'user': {
                'id': 'alice',
                'created_at': '2013-04-18T15:19:04+00:00',
                'updated_at': '2013-04-18T15:19:04+00:00',
                'display_name': 'Alice'
              }
            }
          }
        ]
      }
    }, 'POST');
    const environment = new Environment({
      _links: {
        'self': {
          href: '/api/projects/ffzefzef3/environments/1'
        },
        '#manage-variables': {
          href: '/api/projects/ffzefzef3/environments/1/variables'
        },
        '#deactivate': {
          href: '/api/projects/ffzefzef3/environments/1/deactivate'
        }
      },
      id: 1,
      status: 'active'
    }, 'https://test.com/api/projects/ffzefzef3/environments/1');

    environment.deactivate().then(() => {
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

  it('Get ssh key with the ssh link', () => {
    const environment = new Environment({
      _links: {
        self: {
          href: 'https://test.com/api/projects/ffzefzef3/environments'
        },
        ssh: {
          href: 'ssh://testproject-master-7rqtwti@git.local.c-g.io'
        }
      },
      id: 1
    }, 'https://test.com/api/projects/ffzefzef3/environments');

    const sshUrl = environment.getSshUrl();

    assert.equal(sshUrl, 'testproject-master-7rqtwti@git.local.c-g.io');
  });

  it('Get app ssh key with the ssh link', () => {
    const environment = new Environment({
      _links: {
        self: {
          href: 'https://test.com/api/projects/ffzefzef3/environments'
        },
        ssh: {
          href: 'ssh://testproject-master-7rqtwti@git.local.c-g.io'
        }
      },
      id: 1
    }, 'https://test.com/api/projects/ffzefzef3/environments');

    const sshUrl = environment.getSshUrl('php');

    assert.equal(sshUrl, 'testproject-master-7rqtwti--php@git.local.c-g.io');
  });

  it('Get ssh key with the app ssh link', () => {
    const environment = new Environment({
      _links: {
        self: {
          href: 'https://test.com/api/projects/ffzefzef3/environments'
        },
        'pf:ssh:php': {
          href: 'ssh://testproject-master-7rqtwti--php@git.local.c-g.io'
        }
      },
      id: 1
    }, 'https://test.com/api/projects/ffzefzef3/environments');

    const sshUrl = environment.getSshUrl('php');

    assert.equal(sshUrl, 'testproject-master-7rqtwti--php@git.local.c-g.io');
  });

  it('Get ssh key with the app ssh link in priority', () => {
    const environment = new Environment({
      _links: {
        self: {
          href: 'https://test.com/api/projects/ffzefzef3/environments'
        },
        'pf:ssh:php': {
          href: 'ssh://testproject-master-7rqtwti--php@git.local.c-g.io'
        },
        ssh: {
          href: 'ssh://testproject-master-7rqtwti@git.local.c-g.io'
        }
      },
      id: 1
    }, 'https://test.com/api/projects/ffzefzef3/environments');

    const sshUrl = environment.getSshUrl('php');

    assert.equal(sshUrl, 'testproject-master-7rqtwti--php@git.local.c-g.io');
  });
});
