/* global afterEach, before*/

import { assert } from "chai";
import fetchMock from "fetch-mock";

import { setAuthenticationPromise } from "../src/api";
import { getConfig } from "../src/config";
import Account from "../src/model/Account";

describe("Account", () => {
  const { account_url } = getConfig();

  before(() => {
    setAuthenticationPromise(Promise.resolve("testToken"));
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Get account", done => {
    fetchMock.mock(`${account_url}/platform/users/1`, {
      id: 1,
      email: "test@test.com"
    });

    Account.get({ id: 1 }).then(account => {
      assert.equal(account.id, 1);
      assert.equal(account.email, "test@test.com");
      assert.equal(account.constructor.name, "Account");
      done();
    });
  });

  it("Get accounts", done => {
    const accounts = [
      { id: 1, email: "test1" },
      { id: 2, email: "test2" },
      { id: 3, email: "test3" },
      { id: 4, email: "test4" }
    ];

    fetchMock.mock(
      `${account_url}/platform/users?id=1&id=2&id=3&id=4`,
      accounts
    );

    Account.query({ id: [1, 2, 3, 4] }).then(accts => {
      assert.equal(accts.length, 4);
      assert.equal(accts[0].email, "test1");
      assert.equal(accts[0].constructor.name, "Account");
      done();
    });
  });
});
