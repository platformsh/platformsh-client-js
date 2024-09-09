import { getConfig } from "../../config";
import Ressource from "../Ressource";

import Blob from "./Blob";

const _url = "/projects/:projectId/git/trees/:sha";

export type TreeParams = {
  [key: string]: any;
  projectId?: string;
};

export default class Tree extends Ressource {
  id: string;
  sha: string;
  readonly type = "tree";
  path: string;
  tree: (Tree | Blob | undefined)[];

  constructor(tree: Tree, url = _url, params: TreeParams) {
    super(url, {}, params, tree, [], []);

    this.id = this.id = tree.id ?? "";
    this.sha = this.sha = tree.sha ?? "";
    this.path = this.path = tree.path ?? "";
    this.tree = this.tree = tree.tree ?? [];
  }

  static async get(projectId: string, sha: string) {
    const { api_url } = getConfig();

    const tree = await super._get<Tree>(`${api_url}${_url}`, {
      projectId,
      sha
    });

    if (tree) {
      tree.tree = Tree.bind(tree?.tree, projectId);

      return tree;
    }
  }

  private static bind(trees: (Tree | Blob | undefined)[], projectId: string) {
    return trees.map(o => {
      switch (o?.type) {
        case "tree":
          return new Tree(o, undefined, { projectId, sha: o.sha });
        case "blob":
          return new Blob(o, undefined, { projectId, sha: o.sha });
        default:
          return undefined;
      }
    });
  }

  async getInstance() {
    const tree = await Tree.get(this._params.projectId, this.sha);
    if (tree) {
      tree.path = this.path;

      tree.tree = Tree.bind(tree.tree, this._params.projectId);

      return tree;
    }
  }
}
