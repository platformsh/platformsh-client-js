/* global beforeEach, afterEach*/

import { assert } from "chai";
import fetchMock from "fetch-mock";

import { setAuthenticationPromise } from "../src/api";
import { getConfig } from "../src/config";
import OrganizationMember from "../src/model/OrganizationMember";

describe("OrganizationSubscription", () => {
  const { api_url } = getConfig();

  beforeEach(() => {
    setAuthenticationPromise(Promise.resolve("testToken"));
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Get organization member user", done => {
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

    OrganizationMember.get({ organizationId: "aliceOrg", id: "1" }).then(
      member => {
        assert.equal(member.id, "1");
        assert.equal(member.constructor.name, "OrganizationMember");
        member.getUser().then(user => {
          assert.equal(user.id, "3fa85f64-5717-4562-b3fc-2c963f66afa6");
          assert.equal(user.constructor.name, "AuthUser");
          done();
        });
      }
    );
  });

  it("Update organization member", done => {
    fetchMock.mock(
      "https://api.platform.sh/organizations/aliceOrg/members/1",
      {},
      "PATCH"
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

    member.update({ permissions: ["billing"] }).then(() => {
      done();
    });
  });

  it("Delete organization member", done => {
    fetchMock.mock(
      "https://api.platform.sh/organizations/aliceOrg/members/1",
      {},
      "DELETE"
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

    member.delete().then(() => {
      done();
    });
  });
});
