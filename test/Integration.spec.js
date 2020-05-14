/* global afterEach, before*/

import { assert } from "chai";
import fetchMock from "fetch-mock";

import { getConfig } from "../src/config";
import { setAuthenticationPromise } from "../src/api";
import Integration from "../src/model/Integration";

describe("Integration", () => {
  const { api_url } = getConfig();

  before(function() {
    setAuthenticationPromise(Promise.resolve("testToken"));
  });

  afterEach(function() {
    fetchMock.restore();
  });

  it("Get integrations", done => {
    fetchMock.mock(`${api_url}/projects/ffzefzef3/integrations`, [
      {
        id: 1,
        name: "thevar"
      }
    ]);

    Integration.query({
      projectId: "ffzefzef3"
    }).then(integration => {
      assert.equal(integration.length, 1);
      assert.equal(integration[0].id, 1);
      done();
    });
  });

  it("Get integration", done => {
    fetchMock.mock(`${api_url}/projects/ffzefzef3/integrations/1`, {
      id: 1,
      name: "thevar"
    });

    Integration.get({
      projectId: "ffzefzef3",
      id: "1"
    }).then(integration => {
      assert.equal(integration.id, 1);
      done();
    });
  });

  it("Get activities", done => {
    const url = `${api_url}/projects/ffzefzef3/integrations/12345`;
    fetchMock.mock(`${url}/activities`, [
      {
        id: "1"
      }
    ]);

    const integration = new Integration({
      _links: {
        self: {
          href: url
        }
      },
      id: "12345"
    });

    integration.getActivities().then(activities => {
      assert.equal(activities[0].id, 1);
      assert.equal(activities[0].constructor.name, "Activity");
      done();
    });
  });

  it("Get activity", done => {
    const url = `${api_url}/projects/ffzefzef3/integrations/12345`;
    fetchMock.mock(`${url}/activities/67890`, {
      id: "67890"
    });

    const integration = new Integration({
      _links: {
        self: {
          href: url
        }
      },
      id: "12345"
    });

    integration.getActivity("67890").then(activity => {
      assert.equal(activity.id, "67890");
      assert.equal(activity.constructor.name, "Activity");
      done();
    });
  });
});
