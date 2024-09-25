import fetchMock from "fetch-mock";
import { assert, afterEach, beforeAll, describe, it } from "vitest";

import { setAuthenticationPromise } from "../src/api";
import type { JWTToken } from "../src/authentication";
import { getConfig } from "../src/config";
import { AuthUser } from "../src/model/AuthUser";

describe("AuthUser", () => {
  const { api_url } = getConfig();

  beforeAll(() => {
    setAuthenticationPromise(
      Promise.resolve("testToken" as unknown as JWTToken)
    );
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Get AuthUser", async () => {
    fetchMock.mock(`${api_url}/users/1`, {
      id: 1,
      email: "test@test.com",
      website: "https://example.com"
    });

    await AuthUser.get({ id: "1" }).then(user => {
      assert.equal(user.id, "1");
      assert.equal(user.email, "test@test.com");
      assert.equal(user.constructor.name, "AuthUser");
      assert.equal(user.website, "https://example.com");
    });
  });

  it("Update AuthUser", async () => {
    fetchMock.mock(
      `${api_url}/users/1`,
      {
        email: "test@test.com",
        website: "https://example.com"
      },
      { method: "PATCH" }
    );

    await AuthUser.update("1", {
      email: "test@test.com",
      website: "https://example.com"
    }).then(result => {
      assert.equal(result.constructor.name, "AuthUser");
    });
  });
});
