/* global after, before*/

import { assert } from 'chai';
import fetchMock from 'fetch-mock';

import { setToken } from '../src/api';
import Project from '../src/model/Project';

describe('Project', () => {
  before(function() {
    setToken('testToken');
  });

  after(function() {
    fetchMock.restore();
  });

  it('Get users associated with a project', done => {
    fetchMock.mock('https://test.com/api/projects/ffzefzef3/access', [{id: 1, role: 'r1'}, {id: 2, role: 'r2'}]);
    const project = new Project({
      _links: {
        access: {
          href: '/api/projects/ffzefzef3/access'
        }
      }
    }, 'https://test.com/api/projects/ffzefzef3');

    project.getUsers().then(projectAccess => {
      assert.equal(projectAccess.length, 2);
      assert.equal(projectAccess[0].role, 'r1');
      assert.equal(projectAccess[0].constructor.name, 'ProjectAccess');
      done();
    });
  });

  it('Get git url', () => {
    const project = new Project({
      _links: {
        self: {
          href: '/api/projects/ffzefzef3'
        }
      },
      id: 'ffzefzef3',
      title: 'project title'
    }, 'https://test.com/api/projects/ffzefzef3');
    const gitUrl = project.getGitUrl();

    assert.equal(gitUrl, 'ffzefzef3@git.test.com:ffzefzef3.git');
  });
});
