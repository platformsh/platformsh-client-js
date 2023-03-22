import { assert } from "chai";
import fetchMock from "fetch-mock";

import { getConfig } from "../src/config";
import { setAuthenticationPromise } from "../src/api";
import Blob from "../src/model/git/Blob";

describe("Blob", () => {
  const { api_url } = getConfig();

  before(function () {
    setAuthenticationPromise(Promise.resolve("testToken"));
  });

  afterEach(function () {
    fetchMock.restore();
  });

  it("Get blob", done => {
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

    Blob.get("projectid", "shastring").then(blob => {
      assert.equal(blob.sha, "shastring");
      assert.equal(blob.encoding, "base64");
      assert.equal(blob.size, 12);
      blob.getRawContent().then(b => {
        assert.equal(b, "awesome file");
      });
      assert.equal(blob.constructor.name, "Blob");
      done();
    });
  });
});
