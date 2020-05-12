/* global afterEach, before*/

import { assert } from "chai";
import fetchMock from "fetch-mock";

import { getConfig } from "../src/config";
import { setAuthenticationPromise } from "../src/api";
import ConnectedAccount from "../src/model/ConnectedAccount";

describe("Connected Account", () => {
  const { api_url } = getConfig();

  before(function() {
    setAuthenticationPromise(Promise.resolve("testToken"));
  });

  afterEach(function() {
    fetchMock.restore();
  });

  it("Get connected account", done => {
    fetchMock.mock(`${api_url}/users/user_id/connections/1`, {
      provider: "github",
      subject: "1"
    });

    ConnectedAccount.get("user_id", "1").then(account => {
      assert.equal(account.provider, "github");
      assert.equal(account.subject, "1");
      assert.equal(account.constructor.name, "ConnectedAccount");
      done();
    });
  });

  it("Get connected accounts", done => {
    const connectedAccounts = [
      { provider: "github", subject: "1" },
      { provider: "bitbucket", subject: "2" },
      { provider: "google", subject: "1" }
    ];

    fetchMock.mock(`${api_url}/users/1/connections`, connectedAccounts);

    ConnectedAccount.query("1").then(connectedAccount => {
      assert.equal(connectedAccount.length, 3);
      assert.equal(connectedAccount[1].provider, "bitbucket");
      assert.equal(connectedAccount[1].subject, "2");
      assert.equal(connectedAccount[0].constructor.name, "ConnectedAccount");
      done();
    });
  });

  it("Delete connected account", done => {
    fetchMock.mock(`${api_url}/users/user_id/connections/1`, {
      provider: "github",
      subject: "1"
    });

    fetchMock.mock(`${api_url}/users/user_id/connections/1`, {}, "DELETE");

    ConnectedAccount.get("user_id", "1").then(account => {
      account.delete().then(result => {
        done();
      });
    });
  });
});
