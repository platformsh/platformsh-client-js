import fetchMock from "fetch-mock";
import { assert, afterEach, beforeAll, describe, it } from "vitest";

import { setAuthenticationPromise } from "../src/api";
import type { JWTToken } from "../src/authentication";
import { getConfig } from "../src/config";
import { SourceOperation } from "../src/model/SourceOperation";

describe("Source operation", () => {
  const { api_url } = getConfig();

  beforeAll(() => {
    setAuthenticationPromise(
      Promise.resolve("testToken" as unknown as JWTToken)
    );
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Get SourceOperation", async () => {
    const command = 'set -e\necho "Does this SourceOp run?""\n';
    fetchMock.mock(
      `${api_url}/projects/asdf1234/environments/staging/source-operations`,
      [
        {
          operation: "Test",
          app: "app",
          command
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
