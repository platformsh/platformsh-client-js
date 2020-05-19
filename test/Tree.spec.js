import { assert } from "chai";
import fetchMock from "fetch-mock";

import { getConfig } from "../src/config";
import { setAuthenticationPromise } from "../src/api";
import Tree from "../src/model/git/Tree";

describe("Tree", () => {
  const { api_url } = getConfig();

  before(function() {
    setAuthenticationPromise(Promise.resolve("testToken"));
  });

  afterEach(function() {
    fetchMock.restore();
  });

  it("Get tree", done => {
    fetchMock.mock(`${api_url}/projects/projectid/git/trees/shastring`, {
      id: "shastring",
      _links: {
        self: {
          href:
            "https://region.platform.sh/api/projects/projectid/git/trees/shastring"
        }
      },
      sha: "shastring",
      tree: [
        {
          path: "folder1",
          mode: "100644",
          type: "tree",
          sha: "shastringfolder"
        },
        {
          path: "file2.js",
          mode: "100644",
          type: "blob",
          sha: "shastringfile"
        }
      ]
    });

    fetchMock.mock(`${api_url}/projects/projectid/git/trees/shastringfolder`, {
      id: "shastringfolder",
      _links: {
        self: {
          href:
            "https://region.platform.sh/api/projects/projectid/git/trees/shastring"
        }
      },
      sha: "shastringfolder",
      tree: [
        {
          path: "folder3",
          mode: "100644",
          type: "tree",
          sha: "shastringfolder2"
        }
      ]
    });

    fetchMock.mock(`${api_url}/projects/projectid/git/blobs/shastringfile`, {
      id: "shastring",
      _links: {
        self: {
          href:
            "https://region.platform.sh/api/projects/projectid/git/blobs/shastringfile"
        }
      },
      sha: "shastringfile",
      size: 12,
      encoding: "base64",
      content: "YXdlc29tZSBmaWxl"
    });

    Tree.get("projectid", "shastring").then(tree => {
      assert.equal(tree.sha, "shastring");
      assert.equal(tree.tree.length, 2);

      const blob = tree.tree[1].getInstance().then(b => {
        assert.equal(b.path, "file2.js");
        tree.tree[1].getRawContent().then(c => {
          assert.equal(c, "awesome file");
          tree.tree[0].getInstance().then(t => {
            assert.equal(t.tree.length, 1);
            assert.equal(t.path, "folder1");
            assert.equal(t.sha, "shastringfolder");
            done();
          });
        });
        assert.equal(tree.constructor.name, "Tree");
      });
    });
  });
});
