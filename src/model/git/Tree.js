import Ressource from "../Ressource";
import { getConfig } from "../../config";
import request from "../../api";
import Blob from "./Blob";

const _url = "/projects/:projectId/git/trees/:sha";

function bind(tree, projectId, config) {
  return tree.map(o => {
    switch (o.type) {
      case "tree":
        return new Tree(o, undefined, { projectId, sha: o.sha }, config);
      case "blob":
        return new Blob(o, undefined, { projectId, sha: o.sha }, config);
    }
  });
}

export default class Tree extends Ressource {
  constructor(tree, url = _url, params, config) {
    super(url, {}, params, tree, [], [], config);

    this.id = "";
    this.type = "tree";
    this.sha = "";
    this.path = "";
    this.tree = [];
  }

  static async get(projectId, sha = this.sha, config) {
    const conf = super.getConfig(config);
    const tree = await super.get(`:api_url${_url}`, { projectId, sha }, conf);

    tree.tree = bind(tree.tree, projectId, conf);

    return tree;
  }

  async getInstance() {
    const conf = this.getConfig();

    const tree = await Tree.get(this._params.projectId, this.sha, conf);

    tree.path = this.path;

    tree.tree = bind(tree.tree, this._params.projectId, conf);

    return tree;
  }
}
