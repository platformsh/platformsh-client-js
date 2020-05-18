import { assert } from "chai";
import fetchMock from "fetch-mock";

import { getConfig } from "../src/config";
import { setAuthenticationPromise } from "../src/api";
import Commit from "../src/model/git/Commit";

describe("Commit", () => {
  const { api_url } = getConfig();

  before(function() {
    setAuthenticationPromise(Promise.resolve("testToken"));
  });

  afterEach(function() {
    fetchMock.restore();
  });

  it("Get commit", done => {
    fetchMock.mock(`${api_url}/projects/projectid/git/commits/shastring`, {
      id: "shastring",
      _links: {
        self: {
          href:
            "https://region.platform.sh/api/projects/projectid/git/commits/shastring"
        }
      },
      sha: "shastring",
      author: {
        date: "2020-05-13T10:45:01-04:00",
        name: "author name",
        email: "author@email.com"
      },
      committer: {
        date: "2020-05-13T10:45:01-04:00",
        name: "committer name",
        email: "author@email.com"
      },
      message: "the message\n",
      tree: "shatree",
      parents: ["shaparent"]
    });

    fetchMock.mock(`${api_url}/projects/projectid/git/trees/shatree`, {
      id: "shastring",
      _links: {
        self: {
          href:
            "https://region.platform.sh/api/projects/projectid/git/trees/shastring"
        }
      },
      sha: "shatree",
      tree: [
        {
          path: "folder1",
          mode: "100644",
          type: "tree",
          sha: "shatreefolder"
        },
        {
          path: "file2.js",
          mode: "100644",
          type: "blob",
          sha: "shatreefile"
        }
      ]
    });

    Commit.get("projectid", "shastring").then(commit => {
      assert.equal(commit.sha, "shastring");
      assert.equal(commit.message, "the message\n");
      assert.equal(commit.constructor.name, "Commit");

      commit.getTree().then(t => {
        assert.equal(t.sha, "shatree");
        done();
      });
    });
  });
});
