import Ressource from "../Ressource";
import Tree from "./Tree";
import { getConfig } from "../../config";
import request from "../../api";

const _url = "/projects/:projectId/git/commits/:sha";

export default class Commit extends Ressource {
  constructor(commit, url, params, config) {
    super(url, {}, params, commit, [], [], config);

    this.id = "";
    this.sha = "";
    this.author = "";
    this.committer = "";
    this.message = "";
    this.tree = "";
    this.parents = [];
  }

  static get(projectId, sha, config) {
    return super.get(
      `:api_url${_url}`,
      { projectId, sha },
      super.getConfig(config)
    );
  }

  getTree(projectId = this._params.projectId) {
    return Tree.get(projectId, this.tree, this.getConfig());
  }
}
