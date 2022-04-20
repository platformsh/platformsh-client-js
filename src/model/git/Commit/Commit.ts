import Ressource from "../../Ressource";
import Tree from "../Tree";
import { getConfig } from "../../../config";
import { CommitParams, CommitType } from "./types";
import { autoImplementWithResources } from "../../utils";

const _url = "/projects/:projectId/git/commits/:sha";

export default class Commit extends autoImplementWithResources()<CommitType>() {

  constructor(commit: Commit, url: string, params: CommitParams) {
    super(url, {}, params, commit, [], []);
  }

  static get(projectId: string, sha: string): Promise<Commit> {
    const { api_url } = getConfig();

    return super._get<Commit>(`${api_url}${_url}`, { projectId, sha });
  }

  getTree(projectId = this._params.projectId): Promise<Tree | undefined> {
    return Tree.get(projectId, this.tree);
  }
}
