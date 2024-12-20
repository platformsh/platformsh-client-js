import fetchMock from "fetch-mock";
import { afterEach, assert, describe, beforeAll, it } from "vitest";

import { setAuthenticationPromise } from "../src/api";
import type { JWTToken } from "../src/authentication";
import { getConfig } from "../src/config";
import { Account } from "../src/model/Account";

describe("Account", () => {
  const { api_url } = getConfig();

  beforeAll(() => {
    setAuthenticationPromise(
      Promise.resolve("testToken" as unknown as JWTToken)
    );
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Get account", async () => {
    fetchMock.mock(`${api_url}/users/1`, {
      id: 1,
      email: "test@test.com"
    });

    await Account.get({ id: "1" }).then(account => {
      assert.equal(account.id, "1");
      assert.equal(account.email, "test@test.com");
      assert.equal(account.constructor.name, "Account");
    });
  });

  it("Get accounts", async () => {
    const accounts = [
      { id: "1", email: "test1" },
      { id: "2", email: "test2" },
      { id: "3", email: "test3" },
      { id: "4", email: "test4" }
    ];

    fetchMock.mock(`${api_url}/users?id=1&id=2&id=3&id=4`, accounts);

    await Account.query({ id: ["1", "2", "3", "4"] }).then(accts => {
      assert.equal(accts.length, 4);
      assert.equal(accts[0].email, "test1");
      assert.equal(accts[0].constructor.name, "Account");
    });
  });
});
