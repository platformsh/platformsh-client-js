import fetchMock from "fetch-mock";
import { assert, afterEach, beforeEach, describe, it } from "vitest";

import { setAuthenticationPromise } from "../src/api";
import type { JWTToken } from "../src/authentication";
import { getConfig } from "../src/config";
import { Activity } from "../src/model/Activity";

describe("Activity", () => {
  const { api_url } = getConfig();

  beforeEach(() => {
    setAuthenticationPromise(
      Promise.resolve("testToken" as unknown as JWTToken)
    );
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Wait for activity", async () => {
    let onPollCalled = false;
    let onLogCalled = false;
    const url = `${api_url}/projects/1/activities/2`;

    fetchMock.mock(`${url}?timeout=5.01`, {
      id: 1,
      completion_percent: 100
    });

    const activity = new Activity(
      {
        _links: {
          self: {
            href: url
          }
        },
        id: 1,
        completion_percent: 0
      },
      ""
    );
    const onPoll = () => {
      onPollCalled = true;
    };
    const onLog = () => {
      onLogCalled = true;
    };

    await activity.wait(onPoll, onLog, 0.01).then(a => {
      assert.equal(onPollCalled, true);
      assert.equal(onLogCalled, true);
      assert.equal(a.isComplete(), true);
    });
  });

  it("Get the logs", async () => {
    const activity = new Activity(
      {
        _links: {
          self: {
            href: `${api_url}/projects/1/activities/2`
          }
        },
        id: 1,
        completion_percent: 0,
        log: "The logs"
      },
      ""
    );

    const instance = activity.getLogs(log => {
      assert.equal(log, "The logs");
    });

    await instance.exec();
  });

  it("Stream the logs", async () => {
    fetchMock.mock(`${api_url}/projects/1/activities/2/logs?start_at=0`, {
      body: `{"_id": 1, "data": {"message": "Building application 'app' (runtime type: php:7.0, tree: 55a9ed1)"}}
{"_id": 2, "seal": true}`,
      headers: { "content-type": "application/x-json-stream" }
    });

    const activity = new Activity(
      {
        _links: {
          self: {
            href: `${api_url}/projects/1/activities/2`
          },
          log: {
            href: `${api_url}/projects/1/activities/2/logs`
          }
        },
        id: 1,
        completion_percent: 0
      },
      ""
    );

    const instance = activity.getLogs(logs => {
      assert.equal(logs.length, 2);
      assert.equal(
        logs[0].data.message,
        "Building application 'app' (runtime type: php:7.0, tree: 55a9ed1)"
      );
    });

    await instance.exec();
  });
});
