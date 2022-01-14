import isNode from "detect-node";

import Ressource from "../Ressource";
import { getConfig } from "../../config";
import request from "../../api";

const _url = "/projects/:projectId/git/blobs/:sha";

export default class Blob extends Ressource {
  constructor(blob, url = _url, params) {
    const { api_url } = getConfig();

    super(url, {}, params, blob, [], []);

    this.id = "";
    this.type = "blob";
    this.path = "";
    this.sha = "";
    this.size = "";
    this.encoding = "";
    this.content = "";
  }

  static get(projectId, sha) {
    const { api_url } = getConfig();

    return super._get(`${api_url}${_url}`, { projectId, sha });
  }

  async getInstance() {
    const { api_url } = getConfig();

    const blob = await Blob.get(this._params.projectId, this._params.sha);

    blob.path = this.path;

    return blob;
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
  async getRawContent() {
    if (!this.encoding) {
      const blob = await Blob.get(this._params.projectId, this._params.sha);

      return blob.getRawContent();
    }

    if (this.encoding === "base64") {
      return this.decodeBase64();
    }

    throw new Error("Unrecognised blob encoding: " + this.encoding);
  }
}
