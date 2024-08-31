import { assert, describe, it } from "vitest";

import { setConfig, getConfig } from "../src/config";

describe("Configuration", () => {
  it("Override the authentication configuration", () => {
    let config = getConfig();

    assert.equal(config.client_id, "platform@d4tobd5qpizwa.eu.platform.sh");

    setConfig({
      client_id: "test",
      api_url: "",
      authorization: ""
    });
    config = getConfig();
    assert.equal(config.client_id, "test");
  });
});
