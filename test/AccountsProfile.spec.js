/* global afterEach, before*/

import { assert } from "chai";
import fetchMock from "fetch-mock";

import { getConfig } from "../src/config";
import { setAuthenticationPromise } from "../src/api";
import AccountsProfile from "../src/model/AccountsProfile";

describe("AccountsProfile", () => {
  const { api_url } = getConfig();

  before(function() {
    setAuthenticationPromise(Promise.resolve("testToken"));
  });

  afterEach(function() {
    fetchMock.restore();
  });

  it("Get AccountsProfile", done => {
    fetchMock.mock(`${api_url}/platform/profiles/1`, {
      id: 1,
      display_name: "test",
      email: "test@test.com",
      username: "alice",
      picture: "",
      company_type: ""
    });

    AccountsProfile.get({ id: 1 }).then(user => {
      assert.equal(user.id, 1);
      assert.equal(user.email, "test@test.com");
      assert.equal(user.constructor.name, "AccountsProfile");
      assert.equal(user.username, "alice");
      done();
    });
  });

  it("GetUserIdFromUsername AccountsProfile", done => {
    fetchMock.mock(`${api_url}/v1/profiles?filter[username]=alice`, {
      profiles: [
        {
          id: 1,
          display_name: "test",
          email: "test@test.com",
          username: "alice",
          picture: "",
          company_type: ""
        }
      ]
    });

    AccountsProfile.getUserIdFromUsername("alice").then(user => {
      assert.equal(user.id, 1);
      assert.equal(user.email, "test@test.com");
      assert.equal(user.constructor.name, "AccountsProfile");
      assert.equal(user.username, "alice");
      done();
    });
  });

  it("Update AccountsProfile", done => {
    fetchMock.mock(
      `${api_url}/platform/profiles/1`,
      {
        display_name: "test",
        username: "alice"
      },
      "POST"
    );

    AccountsProfile.update(1, {
      email: "test@test.com",
      website: "https://example.com"
    }).then(result => {
      assert.equal(result.constructor.name, "AccountsProfile");
      done();
    });
  });
});
