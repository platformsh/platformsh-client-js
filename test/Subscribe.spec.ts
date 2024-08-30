import fetchMock from "fetch-mock";
import { assert, afterEach, beforeEach, describe, it } from "vitest";

import { setAuthenticationPromise } from "../src/api";
import type { JWTToken } from "../src/authentication";
import { getConfig } from "../src/config";
import Subscription from "../src/model/Subscription";

describe("Subscribe", () => {
  const { account_url } = getConfig();

  beforeEach(() => {
    setAuthenticationPromise(
      Promise.resolve("testToken" as unknown as JWTToken)
    );
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Wait for subscription", async () => {
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

    await subscription.wait(onPoll, 0.01).then(sub => {
      assert.equal(onPollCalled, true);
      assert.equal(sub.isPending(), false);
    });
  });

  it("Get subscription project", async () => {
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

    await subscription.getProject().then(project => {
      assert.equal(project.title, "theproject");
    });
  });
});
