import fetchMock from "fetch-mock";
import { assert, afterEach, beforeAll, describe, it } from "vitest";

import { setAuthenticationPromise } from "../src/api";
import type { JWTToken } from "../src/authentication";
import { getConfig } from "../src/config";
import { Commit } from "../src/model/git/Commit";

describe("Commit", () => {
  const { api_url } = getConfig();

  beforeAll(() => {
    setAuthenticationPromise(
      Promise.resolve("testToken" as unknown as JWTToken)
    );
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Get commit", async () => {
    fetchMock.mock(`${api_url}/projects/projectid/git/commits/shastring`, {
      id: "shastring",
      _links: {
        self: {
          href: "https://region.platform.sh/api/projects/projectid/git/commits/shastring"
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
          href: "https://region.platform.sh/api/projects/projectid/git/trees/shastring"
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

    await Commit.get("projectid", "shastring").then(async commit => {
      assert.equal(commit.sha, "shastring");
      assert.equal(commit.message, "the message\n");
      assert.equal(commit.constructor.name, "Commit");

      await commit.getTree().then(t => {
        assert.equal(t?.sha, "shatree");
      });
    });
  });
});
