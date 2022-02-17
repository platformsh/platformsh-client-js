import Ressource from "../Ressource";
import Tree from "./Tree";
import { getConfig } from "../../config";

const _url = "/projects/:projectId/git/commits/:sha";

export interface CommitParams {
  projectId?: string,
  [index: string]: any
}

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

    this.id = "";
    this.sha = "";
    this.author = "";
    this.committer = "";
    this.message = "";
    this.tree = "";
    this.parents = [];
  }

  static get(projectId: string, sha: string): Promise<Commit> {
    const { api_url } = getConfig();

    return super._get<Commit>(`${api_url}${_url}`, { projectId, sha });
  }

  getTree(projectId = this._params.projectId): Promise<Tree | undefined> {
    return Tree.get(projectId, this.tree);
  }
}
