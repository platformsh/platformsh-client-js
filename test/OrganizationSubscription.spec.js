/* global beforeEach, afterEach*/

import { assert } from "chai";
import fetchMock from "fetch-mock";

import { getConfig } from "../src/config";
import { setAuthenticationPromise } from "../src/api";
import OrganizationSubscription from "../src/model/OrganizationSubscription";

describe("OrganizationSubscription", () => {
  const { api_url } = getConfig();

  beforeEach(function () {
    setAuthenticationPromise(Promise.resolve("testToken"));
  });

  afterEach(function () {
    fetchMock.restore();
  });

  it("Get organization subscription", done => {
    fetchMock.mock(`${api_url}/organizations/aliceOrg/subscriptions/1`, {
      project_region: "region"
    });
    OrganizationSubscription.get({ organizationId: "aliceOrg", id: "1" }).then(
      subscription => {
        assert.equal(subscription.project_region, "region");
        assert.equal(subscription.constructor.name, "OrganizationSubscription");
        done();
      }
    );
  });

  it("Save organization subscription", done => {
    fetchMock.mock(
      `${api_url}/organizations/aliceOrg/subscriptions`,
      {
        project_region: "region"
      },
      "POST"
    );
    const organizationSubscription = new OrganizationSubscription({
      organizationId: "aliceOrg",
      project_region: "region"
    });
    organizationSubscription
      .save()
      .then(subscription => {
        assert.equal(subscription.constructor.name, "Result");
        done();
      })
      .catch(err => console.log(err));
  });
  it("Get organization subscription estimate", done => {
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
    OrganizationSubscription.get({ organizationId: "aliceOrg", id: "1" }).then(
      subscription => {
        assert.equal(subscription.project_region, "region");
        assert.equal(subscription.constructor.name, "OrganizationSubscription");
        subscription.getEstimate().then(es => {
          done();
        });
      }
    );
  });

  it("Get organization subscriptions", done => {
    fetchMock.mock(`${api_url}/organizations/aliceOrg/subscriptions`, {
      items: [
        {
          project_id: "projectId",
          project_region: "region"
        }
      ]
    });
    OrganizationSubscription.query({ organizationId: "aliceOrg" }).then(
      subscriptions => {
        assert.equal(subscriptions.items.length, 1);
        assert.equal(subscriptions.items[0].project_region, "region");
        assert.equal(subscriptions.items[0].project_id, "projectId");
        assert.equal(
          subscriptions.items[0].constructor.name,
          "OrganizationSubscription"
        );
        done();
      }
    );
  });

  it("Get organization subscriptions with filters", done => {
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
    OrganizationSubscription.query({
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
      done();
    });
  });

  it("Update organization subscription", done => {
    fetchMock.mock(
      `https://api.platform.sh/organizations/aliceOrg/subscriptions/1`,
      {
        project_region: "region"
      },
      "PATCH"
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
    organizationSubscription
      .update({ environments: 3 })
      .then(subscription => {
        assert.equal(subscription.constructor.name, "Result");
        done();
      })
      .catch(err => console.log(err));
  });

  it("Delete organization subscription", done => {
    fetchMock.mock(
      `https://api.platform.sh/organizations/aliceOrg/subscriptions/1`,
      {},
      "DELETE"
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
    organizationSubscription
      .delete()
      .then(() => {
        done();
      })
      .catch(err => console.log(err));
  });
});
