/* global beforeEach, afterEach*/

import { assert } from "chai";
import fetchMock from "fetch-mock";

import { setAuthenticationPromise } from "../src/api";
import { getConfig } from "../src/config";
import Subscription from "../src/model/Subscription";

describe("Subscribe", () => {
  const { account_url } = getConfig();

  beforeEach(() => {
    setAuthenticationPromise(Promise.resolve("testToken"));
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Wait for subscription", done => {
    let onPollCalled = false;

    fetchMock.mock(`${account_url}/subscriptions/1`, {
      body: {
        id: 1,
        status: "active"
      }
    });
    const subscription = new Subscription({
      _links: {
        self: {
          href: `${account_url}/subscriptions/1`
        }
      },
      id: 1,
      status: "requested"
    });
    const onPoll = () => {
      onPollCalled = true;
      fetchMock.restore();
      fetchMock.mock(`${account_url}/subscriptions/1`, {
        body: {
          id: 1,
          status: "active"
        }
      });
    };

    subscription.wait(onPoll, 0.01).then(sub => {
      assert.equal(onPollCalled, true);
      assert.equal(sub.isPending(), false);
      done();
    });
  });

  it("Get subscription project", done => {
    fetchMock.mock("https://test.com/api/projects/ffzefzef3", {
      id: 1,
      title: "theproject"
    });
    const subscription = new Subscription({
      _links: {
        project: {
          href: "https://test.com/api/projects/ffzefzef3"
        }
      },
      id: 1,
      status: "active"
    });

    subscription.getProject().then(project => {
      assert.equal(project.title, "theproject");
      done();
    });
  });
});
