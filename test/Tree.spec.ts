import fetchMock from "fetch-mock";
import { assert, afterEach, beforeAll, describe, it } from "vitest";

import { setAuthenticationPromise } from "../src/api";
import type { JWTToken } from "../src/authentication";
import { getConfig } from "../src/config";
import type Blob from "../src/model/git/Blob";
import Tree from "../src/model/git/Tree";

describe("Tree", () => {
  const { api_url } = getConfig();

  beforeAll(() => {
    setAuthenticationPromise(
      Promise.resolve("testToken" as unknown as JWTToken)
    );
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Get tree", async () => {
    fetchMock.mock(`${api_url}/projects/projectid/git/trees/shastring`, {
      id: "shastring",
      _links: {
        self: {
          href: "https://region.platform.sh/api/projects/projectid/git/trees/shastring"
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
          href: "https://region.platform.sh/api/projects/projectid/git/trees/shastring"
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
          href: "https://region.platform.sh/api/projects/projectid/git/blobs/shastringfile"
        }
      },
      sha: "shastringfile",
      size: 12,
      encoding: "base64",
      content: "YXdlc29tZSBmaWxl"
    });

    await Tree.get("projectid", "shastring").then(async tree => {
      assert.equal(tree?.sha, "shastring");
      assert.equal(tree?.tree.length, 2);

      await tree?.tree[1]?.getInstance().then(async b => {
        assert.equal(b?.path, "file2.js");
        await (tree?.tree[1] as Blob).getRawContent().then(async c => {
          assert.equal(c, "awesome file");
          await (tree?.tree[0] as Tree).getInstance().then(t => {
            assert.equal(t?.tree.length, 1);
            assert.equal(t?.path, "folder1");
            assert.equal(t?.sha, "shastringfolder");
          });
        });
        assert.equal(tree.constructor.name, "Tree");
      });
    });
  });
});
