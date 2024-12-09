import fetchMock from "fetch-mock";
import { assert, afterEach, beforeAll, describe, it } from "vitest";

import type Client from "../src";
import { setAuthenticationPromise } from "../src/api";
import type { JWTToken } from "../src/authentication";
import { getConfig } from "../src/config";
import { Team } from "../src/model/Team";

describe("Team", () => {
  let client: Client;
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
    fetchMock.mock(`${api_url}/teams/1/members`, [{ user: "1" }]);

    const team = new Team({ id: 1 });

    await team.getMembers().then(teamMembers => {
      assert.equal(teamMembers[0].user, "1");
      assert.equal(teamMembers[0].constructor.name, "TeamMember");
    });
  });

  it("Add member", async () => {
    fetchMock.mock(`${api_url}/teams/1/members`, {}, { method: "POST" });

    const team = new Team({ id: 1 }, `${api_url}/teams/1`);

    await team.addMember({ user: "test" }).then(result => {
      assert.equal(result.constructor.name, "Result");
    });
  });
});
