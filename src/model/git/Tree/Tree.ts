import { getConfig } from "../../../config";
import Blob from "../Blob";
import { autoImplementWithResources } from "../../utils";
import { TreeParams, TreeType } from "./types";

const _url = "/projects/:projectId/git/trees/:sha";

function bind(trees: Array<Tree | Blob | undefined>, projectId: string) {
  return trees.map((o: Tree | Blob | undefined) => {
    switch (o?.type) {
      case "tree":
        return new Tree(o as Tree, undefined, { projectId, sha: o.sha });
      case "blob":
        return new Blob(o as Blob, undefined, { projectId, sha: o.sha });
    }
  });
}

export default class Tree extends autoImplementWithResources()<Omit<TreeType,'tree'> & {tree:Array<Tree | Blob | undefined>}>() {
  id: string;
  sha: string;
  type: string;
  path: string;
  tree: Array<Tree | Blob | undefined>;

  constructor(tree: Tree, url = _url, params: TreeParams) {
    super(url, {}, params, tree, [], []);

    this.id = "";
    this.type = "tree";
    this.sha = "";
    this.path = "";
    this.tree = [];
  }

  static async get(projectId: string, sha: string): Promise<Tree | undefined> {
    const { api_url } = getConfig();

    const tree = await super._get<Tree>(`${api_url}${_url}`, { projectId, sha });

    if(tree) {
      tree.tree = bind(tree?.tree, projectId);

      return tree;
    }
  }

  async getInstance() {
    const tree = await Tree.get(this._params.projectId, this.sha);
    if(tree){
      tree.path = this.path;

      tree.tree = bind(tree.tree, this._params.projectId);

      return tree;
    }
  }
}
