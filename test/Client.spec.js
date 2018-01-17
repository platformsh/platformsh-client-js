/* global beforeEach, afterEach*/

import { assert } from 'chai';
import fetchMock from 'fetch-mock';

import { getConfig } from '../src/config';
import Client from '../src';

describe('Client', () => {
  let client;
  const { account_url, authentication_url, api_url } = getConfig();

  beforeEach(function() {
    fetchMock.mock(`${authentication_url}/oauth2/token`, {'access_token': 'test'});
    client = new Client();
  });

  afterEach(function() {
    fetchMock.restore();
  });

  it('Get current Account', done => {
    fetchMock.mock(`${api_url}/platform/me`, {
      id: 1,
      name: 'test',
      projects: [
        {
          id: 'ffzefzef',
          name: 'greatProject',
          endpoint: 'http://test.com/api/projects/ffzefzef'
        }
      ]
    });
    client.getAccountInfo().then(me => {
      assert.equal(me.name, 'test');
      done();
    });
  });

  it('Get project', done => {
    fetchMock.mock(`${api_url}/projects/ffzefzef3`, {
      id: 'ffzefzef1',
      title: 'greatProject',
      endpoint: 'http://test.com/api/projects/ffzefzef1'
    });
    client.getProject('ffzefzef3').then(project => {
      assert.equal(project.title, 'greatProject');
      assert.equal(project.constructor.name, 'Project');
      done();
    });
  });

  it('Get environments', done => {
    fetchMock.mock('https://api.platform.sh/api/projects/ffzefzef3/environments', [{
      id: 1,
      name: 'bestEnv'
    }]);
    client.getEnvironments('ffzefzef3').then(environments => {
      assert.equal(environments.length, 1);
      assert.equal(environments[0].id, 1);
      assert.equal(environments[0].name, 'bestEnv');
      assert.equal(environments[0].constructor.name, 'Environment');
      done();
    });
  });

  it('Get environment', done => {
    fetchMock.mock('https://api.platform.sh/api/projects/ffzefzef3/environments/1', {
      id: 1,
      name: 'bestEnv'
    });
    client.getEnvironment('ffzefzef3', '1').then(environment => {
      assert.equal(environment.id, 1);
      assert.equal(environment.name, 'bestEnv');
      assert.equal(environment.constructor.name, 'Environment');
      done();
    });
  });

  it('Get activities', done => {
    fetchMock.mock('https://api.platform.sh/api/projects/ffzefzef3/environments/1/activities', [{
      id: 1,
      completion_percent: 50
    }]);
    client.getEnvironmentActivities('ffzefzef3', '1').then(activities => {
      assert.equal(activities.length, 1);
      assert.equal(activities[0].id, 1);
      assert.equal(activities[0].completion_percent, 50);
      assert.equal(activities[0].constructor.name, 'Activity');
      done();
    });
  });

  it('Get certificates', done => {
    fetchMock.mock('https://api.platform.sh/api/projects/ffzefzef3/certificates', [{
      id: 1,
      key: 'test'
    }]);
    client.getCertificates('ffzefzef3').then(certificates => {
      assert.equal(certificates.length, 1);
      assert.equal(certificates[0].id, 1);
      assert.equal(certificates[0].key, 'test');
      assert.equal(certificates[0].constructor.name, 'Certificate');
      done();
    });
  });

  it('Add certificates', done => {
    fetchMock.mock('https://api.platform.sh/api/projects/ffzefzef3/certificates', {}, 'POST');

    client.addCertificate('ffzefzef3', 'certif', 'key', 'chain').then(result => {
      assert.equal(result.constructor.name, 'Result');
      done();
    });
  });

  it('Get domains', done => {
    fetchMock.mock('https://api.platform.sh/api/projects/ffzefzef3/domains?limit=2', [{id: 1}]);

    client.getDomains('ffzefzef3', 2).then(domains => {
      assert.equal(domains[0].id, 1);
      assert.equal(domains[0].constructor.name, 'Domain');
      done();
    });
  });

  it('Get environment users', done => {
    fetchMock.mock('https://api.platform.sh/api/projects/ffzefzef3/environments/1/access', [{id: 1}]);

    client.getEnvironmentUsers('ffzefzef3', '1').then(users => {
      assert.equal(users[0].id, 1);
      assert.equal(users[0].constructor.name, 'EnvironmentAccess');
      done();
    });
  });

  it('Get project users', done => {
    fetchMock.mock('https://api.platform.sh/api/projects/ffzefzef3/access', [{id: 1}]);

    client.getProjectUsers('ffzefzef3').then(users => {
      assert.equal(users[0].id, 1);
      assert.equal(users[0].constructor.name, 'ProjectAccess');
      done();
    });
  });

  it('Get variables', done => {
    fetchMock.mock('https://api.platform.sh/api/projects/ffzefzef3/variables?limit=1', [{
      id: 1,
      name: 'theVariableName'
    }]);

    client.getProjectVariables('ffzefzef3', 1).then(activities => {
      assert.equal(activities[0].constructor.name, 'ProjectLevelVariable');
      assert.equal(activities[0].id, 1);
      done();
    });
  });

  it('Get environment variables', done => {
    fetchMock.mock('https://api.platform.sh/api/projects/ffzefzef3/environments/1/variables?limit=1', [{
      id: 1,
      name: 'theVariableName'
    }]);

    client.getEnvironmentVariables('ffzefzef3', '1', 1).then(activities => {
      assert.equal(activities[0].constructor.name, 'Variable');
      assert.equal(activities[0].id, 1);
      done();
    });
  });

  it('Get routes', done => {
    fetchMock.mock('https://api.platform.sh/api/projects/ffzefzef3/environments/1/routes', [{
      id: 1,
      project: 'ffzefzef3'
    }]);

    client.getRoutes('ffzefzef3', 1).then(routes => {
      assert.equal(routes[0].constructor.name, 'Route');
      assert.equal(routes[0].project, 'ffzefzef3');
      done();
    });
  });

  it('Get environment metrics', done => {
    fetchMock.mock('https://api.platform.sh/api/projects/ffzefzef3/environments/1/metrics?q=test', {results: 1});

    client.getEnvironmentMetrics('ffzefzef3', '1', 'test').then(metrics => {
      assert.equal(metrics.results, 1);
      assert.equal(metrics.constructor.name, 'Metrics');
      done();
    });
  });

  it('Get ssh keys', done => {
    fetchMock.mock(`${api_url}/platform/me`, {
      id: 1,
      name: 'test',
      'ssh_keys': [{
        changed: '2017-03-13T17:38:49+01:00'
      }]
    });
    client.getSshKeys().then(sshkeys => {
      assert.equal(sshkeys.length, 1);
      assert.equal(sshkeys[0].constructor.name, 'SshKey');
      done();
    });
  });

  it('Get ssh key', done => {
    fetchMock.mock(`${account_url}/ssh_keys/theId`, {
      changed: '2017-03-13T17:38:49+01:00'
    });
    client.getSshKey({ id: 'theId' }).then(sshkey => {
      assert.equal(sshkey.changed, '2017-03-13T17:38:49+01:00');
      assert.equal(sshkey.constructor.name, 'SshKey');
      done();
    });
  });

  it('Add a bad ssh key', done => {
    fetchMock.mock(`${account_url}/ssh_keys`, {
      changed: '2017-03-13T17:38:49+01:00'
    }, { method: 'POST'});
    client.addSshKey('valueofsshkey', 'titleofsshkey').catch(err => {
      assert.equal(err.value, 'The SSH key is invalid');
      done();
    });
  });

  it('Add a ssh key', done => {
    fetchMock.mock(`${account_url}/ssh_keys`, {
      changed: '2017-03-13T17:38:49+01:00'
    }, { method: 'POST'});
    const validSshKey = 'ssh-rsa MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCMsT3DdVcyLyrr4nOH2gCd3xvXNAZEDxnHQDFzFRel9tVPnWWkz176NK0tYw2SY6SUOAe/2552BuY1s5PV/HiVwxhpompzZ/xxYHLf+mvN/aCnONKUqPsioYhoD2FtTG4WKIBsNv9S5ZCk8YwvJy6kiABq//W9NnSfP58DXTw8wQIDAQAB';// eslint-disable-line max-len

    client.addSshKey(validSshKey, 'titleofsshkey').then(result => {
      assert.equal(result.constructor.name, 'Result');
      done();
    });
  });

  it('Clean request', () => {
    const cleanedReq = client.cleanRequest({
      test: 'ok',
      testNullValue: null
    });

    assert.equal(cleanedReq.testNullValue, undefined);
    assert.equal(cleanedReq.test, 'ok');
  });

  it('Create subscription', done => {
    fetchMock.mock(`${account_url}/platform/subscriptions`, {
      'project_region': 'region'
    }, { method: 'POST'});
    const activationCallback = { uri: 'http://www.google.fr'};

    client.createSubscription('region', 'development', 'title', 'storage', 'environments', activationCallback)
      .then(result => {
        assert.equal(result.constructor.name, 'Result');
        done();
      });
  });

  it('Get subscription', done => {
    fetchMock.mock(`${account_url}/platform/subscriptions/1`, {
      'project_region': 'region'
    });
    client.getSubscription('1')
      .then(subscription => {
        assert.equal(subscription.project_region, 'region');
        assert.equal(subscription.constructor.name, 'Subscription');
        done();
      });
  });

  it('Get subscriptions', done => {
    fetchMock.mock(`${account_url}/platform/subscriptions`, {
      subscriptions: [{
        'project_region': 'region'
      }]
    });
    client.getSubscriptions()
      .then(subscriptions => {
        assert.equal(subscriptions.length, 1);
        assert.equal(subscriptions[0].project_region, 'region');
        assert.equal(subscriptions[0].constructor.name, 'Subscription');
        done();
      });
  });

  it('Get subscriptions with filters', done => {
    fetchMock.mock(
      `${account_url}/platform/subscriptions?filter[project_title][value]=Demo&filter[project_title][operator]=Contains`, //eslint-disable-line
      { subscriptions: [{
        'project_region': 'region'
      }]}
    );
    client.getSubscriptions([{'project_title': {'value': 'Demo', 'operator': 'Contains'}}])
      .then(subscriptions => {
        assert.equal(subscriptions.length, 1);
        assert.equal(subscriptions[0].project_region, 'region');
        assert.equal(subscriptions[0].constructor.name, 'Subscription');
        done();
      });
  });

  it('Get subscription estimate', done => {
    fetchMock.mock(`${account_url}/estimate?plan=plan&storage=storage&environments=environments&user_licenses=users`, {
      key: 'value'
    });
    client.getSubscriptionEstimate('plan', 'storage', 'environments', 'users')
      .then(estimate => {
        assert.equal(estimate.key, 'value');
        done();
      });
  });

  it('Get current deployment informations', done => {
    fetchMock.mock('https://api.platform.sh/api/projects/ffzefzef3/environments/1/deployments/current', {
      webapps: {
        php: {
        }
      }
    });
    client.getCurrentDeployment('ffzefzef3', '1')
      .then(deployment => {
        assert.equal(deployment.constructor.name, 'Deployment');
        done();
      });
  });

  it('Get organizations', done => {
    fetchMock.mock('https://api.platform.sh/api/platform/me', {
      organizations: [{
        id: '1',
        name: 'org1',
        display_name: 'the organization',
        owner: '10'
      }]
    });
    client.getOrganizations()
      .then(organizations => {
        assert.equal(organizations[0].id, '1');
        assert.equal(organizations[0].name, 'org1');
        assert.equal(organizations[0].display_name, 'the organization');
        assert.equal(organizations[0].constructor.name, 'Organization');
        done();
      });
  });

  it('Get organization', done => {
    fetchMock.mock('https://api.platform.sh/api/platform/organizations/1', {
      id: '1',
      name: 'org1',
      display_name: 'the organization',
      owner: '10'
    });
    client.getOrganization('1')
      .then(organization => {
        assert.equal(organization.id, '1');
        assert.equal(organization.name, 'org1');
        assert.equal(organization.display_name, 'the organization');
        assert.equal(organization.constructor.name, 'Organization');
        done();
      });
  });

  it('Get teams', done => {
    fetchMock.mock('https://api.platform.sh/api/platform/me', {
      teams: [{
        id: '1',
        name: 'team1',
        parent: '2'
      }]
    });
    client.getTeams()
      .then(teams => {
        assert.equal(teams[0].id, '1');
        assert.equal(teams[0].name, 'team1');
        assert.equal(teams[0].parent, '2');
        assert.equal(teams[0].constructor.name, 'Team');
        done();
      });
  });

  it('Get team', done => {
    fetchMock.mock('https://api.platform.sh/api/platform/teams/1', {
      id: '1',
      name: 'team1',
      parent: '2'
    });
    client.getTeam('1')
      .then(team => {
        assert.equal(team.id, '1');
        assert.equal(team.name, 'team1');
        assert.equal(team.parent, '2');
        assert.equal(team.constructor.name, 'Team');
        done();
      });
  });

  it('Create team', done => {
    fetchMock.mock('https://api.platform.sh/api/platform/teams', {}, 'POST');
    client.createTeam({ name: 'team1' })
      .then(result => {
        assert.equal(result.constructor.name, 'Result');
        done();
      });
  });

  it('Create organization', done => {
    fetchMock.mock('https://api.platform.sh/api/platform/organizations', {}, 'POST');
    client.createOrganization({ name: 'organization1' })
      .then(result => {
        assert.equal(result.constructor.name, 'Result');
        done();
      });
  });

  it('Get regions', done => {
    fetchMock.mock('https://accounts.platform.sh/api/platform/regions', [{
      available: true,
      endpoint: 'https://staging.plat.farm/api',
      id: 'us.platform.sh',
      label: 'PEPSi Staging',
      private: false,
      provider: 'AWS',
      zone: 'Europe'
    }]);
    client.getRegions()
      .then(regions => {
        assert.equal(regions[0].id, 'us.platform.sh');
        assert.equal(regions[0].endpoint, 'https://staging.plat.farm/api');
        assert.equal(regions[0].available, true);
        assert.equal(regions[0].label, 'PEPSi Staging');
        assert.equal(regions[0].zone, 'Europe');
        assert.equal(regions[0].constructor.name, 'Region');
        done();
      });
  });
});
