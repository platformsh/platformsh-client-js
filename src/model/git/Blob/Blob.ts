import isNode from "detect-node";

import { getConfig } from "../../../config";
import { autoImplementWithResources } from "../../utils";
import { BlobParams, BlobType } from "./types";

const _url = "/projects/:projectId/git/blobs/:sha";

export default class Blob extends autoImplementWithResources()<BlobType>() {
  id: string;
  type: string;
  path: string;
  sha: string;
  encoding: string;
  content: string;
  size: number;

  constructor(blob: Blob, url = _url, params: BlobParams) {
    super(url, {}, params, blob, [], []);

    this.id = "";
    this.type = "blob";
    this.path = "";
    this.sha = "";
    this.encoding = "";
    this.content = "";
    this.size = 0;
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
