import { getConfig } from "../../config";
import Ressource from "../Ressource";

import Tree from "./Tree";

const _url = "/projects/:projectId/git/commits/:sha";

export type CommitParams = {
  [index: string]: any;
  projectId?: string;
};

export default class Commit extends Ressource {
  id: string;
  sha: string;
  author: string;
  committer: string;
  message: string;
  tree: string;
  parents: string[];

  constructor(commit: Commit, url: string, params: CommitParams) {
    super(url, {}, params, commit, [], []);

    this.id = commit.id ?? "";
    this.sha = commit.sha ?? "";
    this.author = commit.author ?? "";
    this.committer = commit.committer ?? "";
    this.message = commit.message ?? "";
    this.tree = commit.tree ?? "";
    this.parents = commit.parents ?? [];
  }

  static async get(projectId: string, sha: string) {
    const { api_url } = getConfig();

    return super._get<Commit>(`${api_url}${_url}`, { projectId, sha });
  }

  async getTree(projectId = this._params.projectId) {
    return Tree.get(projectId, this.tree);
  }
}
