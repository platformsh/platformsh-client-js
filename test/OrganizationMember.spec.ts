import fetchMock from "fetch-mock";
import { assert, afterEach, beforeEach, describe, it } from "vitest";

import { setAuthenticationPromise } from "../src/api";
import type { JWTToken } from "../src/authentication";
import { getConfig } from "../src/config";
import OrganizationMember from "../src/model/OrganizationMember";

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

  it("Get organization member user", async () => {
    fetchMock.mock(`${api_url}/organizations/aliceOrg/members/1`, {
      id: "1",
      organization_id: "aliceOrg",
      user_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      permissions: ["billing"],
      owner: true,
      created_at: "2021-05-18T09:39:06.661Z",
      updated_at: "2021-05-18T09:39:06.661Z",
      _links: {
        self: {
          href: `${api_url}/organizations/aliceOrg/members/1`
        },
        "ref:users:0": {
          href: `${api_url}/user/1?key=test`
        }
      }
    });

    fetchMock.mock(`${api_url}/user/1?key=test`, {
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
    });

    await OrganizationMember.get({ organizationId: "aliceOrg", id: "1" }).then(
      async member => {
        assert.equal(member.id, "1");
        assert.equal(member.constructor.name, "OrganizationMember");
        await member.getUser().then(user => {
          assert.equal(user.id, "3fa85f64-5717-4562-b3fc-2c963f66afa6");
          assert.equal(user.constructor.name, "AuthUser");
        });
      }
    );
  });

  it("Update organization member", async () => {
    fetchMock.mock(
      "https://api.platform.sh/organizations/aliceOrg/members/1",
      {},
      { method: "PATCH" }
    );

    const member = new OrganizationMember({
      id: 1,
      permissions: [],
      _links: {
        "#edit": {
          href: "/organizations/aliceOrg/members/1"
        }
      }
    });

    await member.update({ permissions: ["billing"] });
  });

  it("Delete organization member", async () => {
    fetchMock.mock(
      "https://api.platform.sh/organizations/aliceOrg/members/1",
      {},
      { method: "DELETE" }
    );

    const member = new OrganizationMember({
      id: 1,
      permissions: [],
      _links: {
        delete: {
          href: "/organizations/aliceOrg/members/1"
        }
      }
    });

    await member.delete();
  });
});
