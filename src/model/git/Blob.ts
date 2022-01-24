import isNode from "detect-node";

import Ressource from "../Ressource";
import { getConfig } from "../../config";

const _url = "/projects/:projectId/git/blobs/:sha";

export type BlobParams = {
  projectId: string,
  sha: string
};

export default class Blob extends Ressource {
  id: string;
  type: string;
  path: string;
  sha: string;
  size: string;
  encoding: string;
  content: string;

  constructor(blob: Blob, url = _url, params: BlobParams) {
    super(url, {}, params, blob, [], []);

    this.id = "";
    this.type = "blob";
    this.path = "";
    this.sha = "";
    this.size = "";
    this.encoding = "";
    this.content = "";
  }

  static get(projectId: string, sha: string) : Promise<Blob> {
    const { api_url } = getConfig();

    return super._get<Blob>(`${api_url}${_url}`, { projectId, sha });
  }

  async getInstance(): Promise<Blob| undefined> {
    const blob = await Blob.get(this._params.projectId, this._params.sha);

    if(blob) {
      blob.path = this.path;

      return blob;
    }
  }

  decodeBase64() {
    let content;
    if (isNode) {
      content = Buffer.from(this.content, "base64").toString();
    } else {
      content = atob(this.content);
    }

    return content;
  }

  /**
   * Get the raw content of the file.
   *
   * @return string
   */
  async getRawContent(): Promise<string | undefined> {
    if (!this.encoding) {
      const blob = await Blob.get(this._params.projectId, this._params.sha);

      return blob?.getRawContent();
    }

    if (this.encoding === "base64") {
      return this.decodeBase64();
    }

    throw new Error("Unrecognised blob encoding: " + this.encoding);
  }
}
