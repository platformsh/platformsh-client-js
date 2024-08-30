import fetchMock from "fetch-mock";
import { assert, afterEach, beforeAll, describe, it } from "vitest";

import { setAuthenticationPromise } from "../src/api";
import type { JWTToken } from "../src/authentication";
import Team from "../src/model/Team";

describe("Team", () => {
  beforeAll(() => {
    setAuthenticationPromise(
      Promise.resolve("testToken" as unknown as JWTToken)
    );
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Get members", async () => {
    fetchMock.mock("https://api.platform.sh/api/platform/teams/1/members", [
      { user: "1" }
    ]);

    const team = new Team({ id: 1 });

    await team.getMembers().then(teamMembers => {
      assert.equal(teamMembers[0].user, "1");
      assert.equal(teamMembers[0].constructor.name, "TeamMember");
    });
  });

  it("Add member", async () => {
    fetchMock.mock(
      "https://api.platform.sh/api/platform/teams/1/members",
      {},
      { method: "POST" }
    );

    const team = new Team(
      { id: 1 },
      "https://api.platform.sh/api/platform/teams/1"
    );

    await team.addMember({ user: "test" }).then(result => {
      assert.equal(result.constructor.name, "Result");
    });
  });
});
