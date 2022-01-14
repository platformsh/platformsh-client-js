import Ressource from "../Ressource";
import { getConfig } from "../../config";
import request from "../../api";
import Blob from "./Blob";

const _url = "/projects/:projectId/git/trees/:sha";

function bind(tree, projectId) {
  return tree.map(o => {
    switch (o.type) {
      case "tree":
        return new Tree(o, undefined, { projectId, sha: o.sha });
      case "blob":
        return new Blob(o, undefined, { projectId, sha: o.sha });
    }
  });
}

export default class Tree extends Ressource {
  constructor(tree, url = _url, params) {
    const { api_url } = getConfig();

    super(url, {}, params, tree, [], []);

    this.id = "";
    this.type = "tree";
    this.sha = "";
    this.path = "";
    this.tree = [];
  }

  static async get(projectId, sha = this.sha) {
    const { api_url } = getConfig();

    const tree = await super._get(`${api_url}${_url}`, { projectId, sha });

    tree.tree = bind(tree.tree, projectId);

    return tree;
  }

  async getInstance() {
    const { api_url } = getConfig();

    const tree = await Tree.get(this._params.projectId, this.sha);

    tree.path = this.path;

    tree.tree = bind(tree.tree, this._params.projectId);

    return tree;
  }
}
