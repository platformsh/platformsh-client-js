import fetchMock from "fetch-mock";
import { assert, afterEach, beforeAll, describe, it } from "vitest";

import { setAuthenticationPromise } from "../src/api";
import type { JWTToken } from "../src/authentication";
import { getConfig } from "../src/config";
import { ConnectedAccount } from "../src/model/ConnectedAccount";

describe("Connected Account", () => {
  const { api_url } = getConfig();

  beforeAll(() => {
    setAuthenticationPromise(
      Promise.resolve("testToken" as unknown as JWTToken)
    );
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Get connected account", async () => {
    fetchMock.mock(`${api_url}/users/user_id/connections/1`, {
      provider: "github",
      subject: "1"
    });

    await ConnectedAccount.get("user_id", "1").then(account => {
      assert.equal(account.provider, "github");
      assert.equal(account.subject, "1");
      assert.equal(account.constructor.name, "ConnectedAccount");
    });
  });

  it("Get connected accounts", async () => {
    const connectedAccounts = [
      { provider: "github", subject: "1" },
      { provider: "bitbucket", subject: "2" },
      { provider: "google", subject: "1" }
    ];

    fetchMock.mock(`${api_url}/users/1/connections`, connectedAccounts);

    await ConnectedAccount.query("1").then(connectedAccount => {
      assert.equal(connectedAccount.length, 3);
      assert.equal(connectedAccount[1].provider, "bitbucket");
      assert.equal(connectedAccount[1].subject, "2");
      assert.equal(connectedAccount[0].constructor.name, "ConnectedAccount");
    });
  });

  it("Delete connected account", async () => {
    fetchMock.mock(
      `${api_url}/users/user_id/connections/1`,
      {
        provider: "github",
        subject: "1"
      },
      { method: "GET" }
    );

    fetchMock.mock(
      `${api_url}/users/user_id/connections/1`,
      {},
      { method: "DELETE" }
    );

    await ConnectedAccount.get("user_id", "1").then(async account => {
      await account.delete();
    });
  });
});
