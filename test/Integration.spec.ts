import fetchMock from "fetch-mock";
import { assert, afterEach, beforeAll, describe, it } from "vitest";

import { setAuthenticationPromise } from "../src/api";
import type { JWTToken } from "../src/authentication";
import { getConfig } from "../src/config";
import { Integration } from "../src/model/Integration";

describe("Integration", () => {
  const { api_url } = getConfig();

  beforeAll(() => {
    setAuthenticationPromise(
      Promise.resolve("testToken" as unknown as JWTToken)
    );
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Get integrations", async () => {
    fetchMock.mock(`${api_url}/projects/ffzefzef3/integrations`, [
      {
        id: 1,
        name: "thevar"
      }
    ]);

    await Integration.query({
      projectId: "ffzefzef3"
    }).then(integration => {
      assert.equal(integration.length, 1);
      assert.equal(integration[0].id, "1");
    });
  });

  it("Delete integration", async () => {
    fetchMock.mock(
      `${api_url}/projects/ffzefzef3/integrations/integration_id`,
      {},
      { method: "DELETE" }
    );
    const integration = new Integration(
      {
        _links: {
          "#delete": {
            href: "/projects/ffzefzef3/integrations/integration_id"
          }
        },
        id: 1,
        status: "inactive"
      },
      `${api_url}/projects/ffzefzef3/integrations/integration_id`
    );

    await integration.delete();
  });

  it("Get integration", async () => {
    fetchMock.mock(`${api_url}/projects/ffzefzef3/integrations/1`, {
      id: 1,
      name: "thevar"
    });

    await Integration.get({
      projectId: "ffzefzef3",
      id: "1"
    }).then(integration => {
      assert.equal(integration.id, "1");
    });
  });

  it("Get activities", async () => {
    const url = `${api_url}/projects/ffzefzef3/integrations/12345`;
    fetchMock.mock(`${url}/activities`, [
      {
        id: "1"
      }
    ]);

    const integration = new Integration(
      {
        _links: {
          self: {
            href: url
          }
        },
        id: "12345"
      },
      ""
    );

    await integration.getActivities().then(activities => {
      assert.equal(activities[0].id, "1");
      assert.equal(activities[0].constructor.name, "Activity");
    });
  });

  it("Get activity", async () => {
    const url = `${api_url}/projects/ffzefzef3/integrations/12345`;
    fetchMock.mock(`${url}/activities/67890`, {
      id: "67890"
    });

    const integration = new Integration(
      {
        _links: {
          self: {
            href: url
          }
        },
        id: "12345"
      },
      ""
    );

    await integration.getActivity("67890").then(activity => {
      assert.equal(activity.id, "67890");
      assert.equal(activity.constructor.name, "Activity");
    });
  });
});
