import fetchMock from "fetch-mock";
import { assert, afterEach, beforeEach, describe, it } from "vitest";

import { setAuthenticationPromise } from "../src/api";
import type { JWTToken } from "../src/authentication";
import { getConfig } from "../src/config";
import OrganizationSubscription from "../src/model/OrganizationSubscription";

describe("OrganizationSubscription", () => {
  const { api_url } = getConfig();

  beforeEach(() => {
    setAuthenticationPromise(
      Promise.resolve("testToken" as unknown as JWTToken)
    );
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Get organization subscription", async () => {
    fetchMock.mock(`${api_url}/organizations/aliceOrg/subscriptions/1`, {
      project_region: "region"
    });
    await OrganizationSubscription.get({
      organizationId: "aliceOrg",
      id: "1"
    }).then(subscription => {
      assert.equal(subscription.project_region, "region");
      assert.equal(subscription.constructor.name, "OrganizationSubscription");
    });
  });

  it("Save organization subscription", async () => {
    fetchMock.mock(
      `${api_url}/organizations/aliceOrg/subscriptions`,
      {
        project_region: "region"
      },
      { method: "POST" }
    );
    const organizationSubscription = new OrganizationSubscription({
      organizationId: "aliceOrg",
      project_region: "region"
    });
    await organizationSubscription.save().then(subscription => {
      assert.equal(subscription.constructor.name, "Result");
    });
  });
  it("Get organization subscription estimate", async () => {
    fetchMock.mock(`${api_url}/organizations/aliceOrg/subscriptions/1`, {
      id: 1,
      project_region: "region",
      plan: "test_plan",
      storage: "test_storage",
      environments: [],
      user_licenses: ["test_user_licenses"]
    });

    fetchMock.mock(
      `${api_url}/organizations/aliceOrg/subscriptions/1/estimate?plan=test_plan&storage=test_storage&`,
      {
        project_region: "region"
      }
    );
    await OrganizationSubscription.get({
      organizationId: "aliceOrg",
      id: "1"
    }).then(async subscription => {
      assert.equal(subscription.project_region, "region");
      assert.equal(subscription.constructor.name, "OrganizationSubscription");
      await subscription.getEstimate();
    });
  });

  it("Get organization subscriptions", async () => {
    fetchMock.mock(`${api_url}/organizations/aliceOrg/subscriptions`, {
      items: [
        {
          project_id: "projectId",
          project_region: "region"
        }
      ]
    });
    await OrganizationSubscription.query({ organizationId: "aliceOrg" }).then(
      subscriptions => {
        assert.equal(subscriptions.items.length, 1);
        assert.equal(subscriptions.items[0].project_region, "region");
        assert.equal(subscriptions.items[0].project_id, "projectId");
        assert.equal(
          subscriptions.items[0].constructor.name,
          "OrganizationSubscription"
        );
      }
    );
  });

  it("Get organization subscriptions with filters", async () => {
    fetchMock.mock(
      `${api_url}/organizations/aliceOrg/subscriptions?filter[status][value][]=active&filter[status][value][]=suspended&filter[status][operator]=IN`,
      {
        items: [
          {
            project_region: "region"
          }
        ]
      }
    );
    await OrganizationSubscription.query({
      organizationId: "aliceOrg",
      filter: {
        status: {
          value: ["active", "suspended"],
          operator: "IN"
        }
      }
    }).then(subscriptions => {
      assert.equal(subscriptions.items.length, 1);
      assert.equal(subscriptions.items[0].project_region, "region");
      assert.equal(
        subscriptions.items[0].constructor.name,
        "OrganizationSubscription"
      );
    });
  });

  it("Update organization subscription", async () => {
    fetchMock.mock(
      `https://api.platform.sh/organizations/aliceOrg/subscriptions/1`,
      {
        project_region: "region"
      },
      { method: "PATCH" }
    );
    const organizationSubscription = new OrganizationSubscription({
      id: 1,
      organizationId: "aliceOrg",
      project_region: "region",
      _links: {
        self: {
          href: "/organizations/aliceOrg/subscriptions/1"
        }
      }
    });
    await organizationSubscription
      .update({ environments: 3 })
      .then(subscription => {
        assert.equal(subscription.constructor.name, "Result");
      });
  });

  it("Delete organization subscription", async () => {
    fetchMock.mock(
      `https://api.platform.sh/organizations/aliceOrg/subscriptions/1`,
      {},
      { method: "DELETE" }
    );
    const organizationSubscription = new OrganizationSubscription({
      id: 1,
      organizationId: "aliceOrg",
      project_region: "region",
      _links: {
        self: {
          href: "/organizations/aliceOrg/subscriptions/1"
        },
        "#delete": {
          href: "/organizations/aliceOrg/subscriptions/1"
        }
      }
    });
    await organizationSubscription.delete();
  });
});
