/* global afterEach, before*/

import { assert } from "chai";
import fetchMock from "fetch-mock";

import { setAuthenticationPromise } from "../src/api";
import SourceOperation from "../src/model/SourceOperation";

describe("Team", () => {
  before(function() {
    setAuthenticationPromise(Promise.resolve("testToken"));
  });

  afterEach(function() {
    fetchMock.restore();
  });

  it("Get SourceOperation", async () => {
    const command = 'set -e\necho "Does this SourceOp run?""\n';
    fetchMock.mock(
      "https://api.platform.sh/api/projects/asdf1234/environments/staging/source-operations",
      [
        {
          operation: "Test",
          app: "app",
          command: command
        }
      ]
    );
    const [testOp] = await SourceOperation.query({
      projectId: "asdf1234",
      environmentId: "staging"
    });
    assert.equal(testOp.command, command);
    assert.equal(testOp.operation, "Test");
  });
});
