import fetchMock from "fetch-mock";
import { assert, afterEach, beforeAll, describe, it } from "vitest";

import { setAuthenticationPromise } from "../src/api";
import type { JWTToken } from "../src/authentication";
import { getConfig } from "../src/config";
import { AccountsProfile } from "../src/model/AccountsProfile";

describe("AccountsProfile", () => {
  const { api_url } = getConfig();

  beforeAll(() => {
    setAuthenticationPromise(
      Promise.resolve("testToken" as unknown as JWTToken)
    );
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Get AccountsProfile", async () => {
    fetchMock.mock(`${api_url}/platform/profiles/1`, {
      id: 1,
      display_name: "test",
      email: "test@test.com",
      username: "alice",
      picture: "",
      company_type: ""
    });

    await AccountsProfile.get({ id: "1" }).then(user => {
      assert.equal(user.id, "1");
      assert.equal(user.email, "test@test.com");
      assert.equal(user.constructor.name, "AccountsProfile");
      assert.equal(user.username, "alice");
    });
  });

  it("GetUserIdFromUsername AccountsProfile", async () => {
    fetchMock.mock(`${api_url}/v1/profiles?filter[username]=alice`, {
      profiles: [
        {
          id: "1",
          display_name: "test",
          email: "test@test.com",
          username: "alice",
          picture: "",
          company_type: ""
        }
      ]
    });

    await AccountsProfile.getUserByUsername("alice").then(user => {
      assert.equal(user.id, "1");
      assert.equal(user.email, "test@test.com");
      assert.equal(user.constructor.name, "AccountsProfile");
      assert.equal(user.username, "alice");
    });
  });

  it("Update AccountsProfile", async () => {
    fetchMock.mock(
      `${api_url}/platform/profiles/1`,
      {
        display_name: "test",
        username: "alice"
      },
      { method: "PATCH" }
    );

    await AccountsProfile.update("1", {
      email: "test@test.com",
      website: "https://example.com"
    }).then(result => {
      assert.equal(result.constructor.name, "AccountsProfile");
    });
  });
});
