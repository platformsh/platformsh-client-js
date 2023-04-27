/* global afterEach, before*/

import { assert } from "chai";
import fetchMock from "fetch-mock";

import { setAuthenticationPromise } from "../src/api";
import Organization from "../src/model/Organization";

describe("Organization", () => {
  before(() => {
    setAuthenticationPromise(Promise.resolve("testToken"));
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Get members", done => {
    fetchMock.mock("https://api.platform.sh/api/organizations/1/members", {
      items: [{ user_id: "1" }]
    });

    const organization = new Organization({ id: 1 });

    organization.getMembers().then(organizationMembers => {
      assert.equal(organizationMembers.items[0].user_id, "1");
      assert.equal(
        organizationMembers.items[0].constructor.name,
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

  it("Update organization", done => {
    fetchMock.mock(
      "https://api.platform.sh/api/organizations/aliceorg",
      {},
      "PATCH"
    );

    const organization = new Organization(
      { id: "aliceorg" },
      "https://api.platform.sh/api/organizations/aliceorg"
    );

    organization.update({ name: "test" }).then(result => {
      assert.equal(result.constructor.name, "Result");
      done();
    });
  });

  it("Get vouchers", done => {
    fetchMock.mock("https://api.platform.sh/api/organizations/1/vouchers", {
      vouchers: [{ code: "voucher-1" }]
    });

    const organization = new Organization({ id: 1 });

    organization.getVouchers().then(organizationVouchers => {
      assert.equal(organizationVouchers.data.vouchers[0].code, "voucher-1");
      assert.equal(
        organizationVouchers.constructor.name,
        "OrganizationVoucher"
      );
      done();
    });
  });

  it("Add voucher", done => {
    fetchMock.mock(
      "https://api.platform.sh/api/organizations/1/vouchers/apply",
      {},
      "POST"
    );

    const organization = new Organization(
      { id: 1 },
      "https://api.platform.sh/api/organizations/1"
    );

    organization.addVoucher({ code: "voucher-1" }).then(result => {
      assert.equal(result.constructor.name, "Result");
      done();
    });
  });

  it("Add subsciption", done => {
    fetchMock.mock(
      "https://api.platform.sh/api/organizations/1/subscriptions",
      {},
      "POST"
    );

    const organization = new Organization(
      { id: 1 },
      "https://api.platform.sh/api/organizations/1"
    );

    organization
      .addSubscription({
        defaultBranch: "main",
        organizationId: "01GF31FWWMP6ZXDQPMHBQKBSXK",
        project_region: "org.recreation.plat.farm",
        project_title: "wq",
        title: "wq"
      })
      .then(result => {
        assert.equal(result.constructor.name, "Result");
        done();
      });
  });
});
