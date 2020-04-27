/* global afterEach, before*/

import { assert } from "chai";
import fetchMock from "fetch-mock";

import { getConfig } from "../src/config";
import { setAuthenticationPromise } from "../src/api";
import AuthUser from "../src/model/AuthUser";

describe("AuthUser", () => {
  const { api_url } = getConfig();

  before(function() {
    setAuthenticationPromise(Promise.resolve("testToken"));
  });

  afterEach(function() {
    fetchMock.restore();
  });

  it("Get AuthUser", done => {
    fetchMock.mock(`${api_url}/users/1`, {
      id: 1,
      email: "test@test.com",
      website: "https://example.com"
    });

    AuthUser.get({ id: 1 }).then(user => {
      assert.equal(user.id, 1);
      assert.equal(user.email, "test@test.com");
      assert.equal(user.constructor.name, "AuthUser");
      assert.equal(user.website, "https://example.com");
      done();
    });
  });

  it("Update AuthUser", done => {
    fetchMock.mock(
      `${api_url}/users/1`,
      {
        email: "test@test.com",
        website: "https://example.com"
      },
      "POST"
    );

    AuthUser.update(1, {
      email: "test@test.com",
      website: "https://example.com"
    }).then(result => {
      assert.equal(result.constructor.name, "AuthUser");
      done();
    });
  });
});
