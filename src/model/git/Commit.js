import Ressource from "../Ressource";
import Tree from "./Tree";
import { getConfig } from "../../config";
import request from "../../api";

const _url = "/projects/:projectId/git/commits/:sha";

export default class Commit extends Ressource {
  constructor(commit, url, params) {
    const { api_url } = getConfig();

    super(url, {}, params, commit, [], []);

    this.id = "";
    this.sha = "";
    this.author = "";
    this.committer = "";
    this.message = "";
    this.tree = "";
    this.parents = [];
  }

  static get(projectId, sha) {
    const { api_url } = getConfig();

    return super._get(`${api_url}${_url}`, { projectId, sha });
  }

  getTree(projectId = this._params.projectId) {
    return Tree.get(projectId, this.tree);
  }
}
