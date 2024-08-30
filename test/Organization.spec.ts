import fetchMock from "fetch-mock";
import type OrganizationMember from "src/model/OrganizationMember";
import { assert, afterEach, beforeAll, describe, it } from "vitest";

import { setAuthenticationPromise } from "../src/api";
import type { JWTToken } from "../src/authentication";
import Organization from "../src/model/Organization";

describe("Organization", () => {
  beforeAll(() => {
    setAuthenticationPromise(
      Promise.resolve("testToken" as unknown as JWTToken)
    );
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Get members", async () => {
    fetchMock.mock("https://api.platform.sh/api/organizations/1/members", {
      items: [{ user_id: "1" }]
    });

    const organization = new Organization({ id: 1 });

    await organization.getMembers().then(organizationMembers => {
      assert.equal(organizationMembers.items[0].user_id, "1");
      assert.equal(
        organizationMembers.items[0].constructor.name,
        "OrganizationMember"
      );
    });
  });

  it("Add member", async () => {
    fetchMock.mock(
      "https://api.platform.sh/api/organizations/1/members",
      {},
      { method: "POST" }
    );

    const organization = new Organization(
      { id: 1 },
      "https://api.platform.sh/api/organizations/1"
    );

    await organization
      .addMember({ user_id: "test" } as OrganizationMember)
      .then(result => {
        assert.equal(result.constructor.name, "Result");
      });
  });

  it("Update organization", async () => {
    fetchMock.mock(
      "https://api.platform.sh/api/organizations/aliceorg",
      {},
      { method: "PATCH" }
    );

    const organization = new Organization(
      { id: "aliceorg" },
      "https://api.platform.sh/api/organizations/aliceorg"
    );

    await organization.update({ name: "test" }).then(result => {
      assert.equal(result.constructor.name, "Result");
    });
  });

  it("Get vouchers", async () => {
    fetchMock.mock("https://api.platform.sh/api/organizations/1/vouchers", {
      vouchers: [{ code: "voucher-1" }]
    });

    const organization = new Organization({ id: 1 });

    await organization.getVouchers().then(organizationVouchers => {
      assert.equal(organizationVouchers.vouchers[0].code, "voucher-1");
      assert.equal(
        organizationVouchers.constructor.name,
        "OrganizationVoucher"
      );
    });
  });

  it("Add voucher", async () => {
    fetchMock.mock(
      "https://api.platform.sh/api/organizations/1/vouchers/apply",
      {},
      { method: "POST" }
    );

    const organization = new Organization(
      { id: 1 },
      "https://api.platform.sh/api/organizations/1"
    );

    await organization.addVoucher("voucher-1").then(result => {
      assert.equal(result.constructor.name, "Result");
    });
  });

  it("Add subsciption", async () => {
    fetchMock.mock(
      "https://api.platform.sh/api/organizations/1/subscriptions",
      {},
      { method: "POST" }
    );

    const organization = new Organization(
      { id: 1 },
      "https://api.platform.sh/api/organizations/1"
    );

    await organization
      .addSubscription({
        defaultBranch: "main",
        project_region: ""
      })
      .then(result => {
        assert.equal(result.constructor.name, "Result");
      });
  });
});
