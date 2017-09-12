/* global beforeEach, afterEach*/

import { assert } from 'chai';
import fetchMock from 'fetch-mock';

import { getConfig } from '../src/config';
import { setAuthenticationPromise } from '../src/api';
import Activity from '../src/model/Activity';

describe('Activity', () => {
  const { account_url } = getConfig();

  beforeEach(function() {
    setAuthenticationPromise(Promise.resolve('testToken'));
  });

  afterEach(function() {
    // fetchMock.restore();
  });

  it('Wait for activity', done => {
    let onPollCalled = false;
    let onLogCalled = false;
    const url = `${account_url}/projects/1/activities/2`;

    fetchMock.mock(`${url}?timeout=5.01`, {
      id: 1,
      completion_percent: 100
    });

    const activity = new Activity({
      _links: {
        self: {
          href: url
        }
      },
      id: 1,
      completion_percent: 0
    });
    const onPoll = () => {
      onPollCalled = true;
    };
    const onLog = () => {
      onLogCalled = true;
    };

    activity.wait(onPoll, onLog, 0.01).then(activity => {
      assert.equal(onPollCalled, true);
      assert.equal(onLogCalled, true);
      assert.equal(activity.isComplete(), true);
      done();
    });
  });
});
