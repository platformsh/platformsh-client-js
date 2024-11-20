import fetchMock from "fetch-mock";
import { assert, afterEach, beforeAll, describe, it } from "vitest";

import { setAuthenticationPromise } from "../src/api";
import type { JWTToken } from "../src/authentication";
import { getConfig } from "../src/config";
import { Organization } from "../src/model/Organization";
import type { OrganizationMember } from "../src/model/OrganizationMember";

describe("Organization", () => {
  const { api_url } = getConfig();

  beforeAll(() => {
    setAuthenticationPromise(
      Promise.resolve("testToken" as unknown as JWTToken)
    );
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Get members", async () => {
    fetchMock.mock(`${api_url}/organizations/1/members`, {
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
      `${api_url}/organizations/1/members`,
      {},
      { method: "POST" }
    );

    const organization = new Organization(
      { id: 1 },
      `${api_url}//organizations/1`
    );

    await organization
      .addMember({ user_id: "test" } as OrganizationMember)
      .then(result => {
        assert.equal(result.constructor.name, "Result");
      });
  });

  it("Update organization", async () => {
    fetchMock.mock(
      `${api_url}/organizations/aliceorg`,
      {},
      { method: "PATCH" }
    );

    const organization = new Organization(
      { id: "aliceorg" },
      `${api_url}/organizations/aliceorg`
    );

    await organization.update({ name: "test" }).then(result => {
      assert.equal(result.constructor.name, "Result");
    });
  });

  it("Get vouchers", async () => {
    fetchMock.mock(`${api_url}/organizations/1/vouchers`, {
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
      `${api_url}/organizations/1/vouchers/apply`,
      {},
      { method: "POST" }
    );

    const organization = new Organization(
      { id: 1 },
      `${api_url}/organizations/1`
    );

    await organization.addVoucher("voucher-1").then(result => {
      assert.equal(result.constructor.name, "Result");
    });
  });

  it("Add subsciption", async () => {
    fetchMock.mock(
      `${api_url}/organizations/1/subscriptions`,
      {},
      { method: "POST" }
    );

    const organization = new Organization(
      { id: 1 },
      `${api_url}/organizations/1`
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
