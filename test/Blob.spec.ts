import fetchMock from "fetch-mock";
import { assert, afterEach, beforeAll, describe, it } from "vitest";

import { setAuthenticationPromise } from "../src/api";
import type { JWTToken } from "../src/authentication";
import { getConfig } from "../src/config";
import Blob from "../src/model/git/Blob";

describe("Blob", () => {
  const { api_url } = getConfig();

  beforeAll(() => {
    setAuthenticationPromise(
      Promise.resolve("testToken" as unknown as JWTToken)
    );
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Get blob", async () => {
    fetchMock.mock(`${api_url}/projects/projectid/git/blobs/shastring`, {
      id: "shastring",
      _links: {
        self: {
          href: "https://region.platform.sh/api/projects/projectid/git/blobs/shastring"
        }
      },
      sha: "shastring",
      size: 12,
      encoding: "base64",
      content: "YXdlc29tZSBmaWxl"
    });

    await Blob.get("projectid", "shastring").then(async blob => {
      assert.equal(blob.sha, "shastring");
      assert.equal(blob.encoding, "base64");
      assert.equal(blob.size, "12");
      await blob.getRawContent().then(b => {
        assert.equal(b, "awesome file");
      });
      assert.equal(blob.constructor.name, "Blob");
    });
  });
});
