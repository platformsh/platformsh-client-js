/* global afterEach, before*/

import { assert } from "chai";
import fetchMock from "fetch-mock";

import { setAuthenticationPromise } from "../src/api";
import Organization from "../src/model/Organization";

describe("Organization", () => {
  before(function() {
    setAuthenticationPromise(Promise.resolve("testToken"));
  });

  afterEach(function() {
    fetchMock.restore();
  });

  it("Get members", done => {
    fetchMock.mock("https://api.platform.sh/api/organizations/1/members", {
      items: [{ user_id: "1" }]
    });

    const organization = new Organization({ id: 1 });

    organization.getMembers().then(organizationMembers => {
      assert.equal(organizationMembers[0].user_id, "1");
      assert.equal(
        organizationMembers[0].constructor.name,
        "OrganizationMember"
      );
      done();
    });
  });

  it("Add member", done => {
    fetchMock.mock(
      "https://api.platform.sh/api/organizations/1/members",
      {},
      "POST"
    );

    const organization = new Organization(
      { id: 1 },
      "https://api.platform.sh/api/organizations/1"
    );

    organization.addMember({ user: "test" }).then(result => {
      assert.equal(result.constructor.name, "Result");
      done();
    });
  });
});
