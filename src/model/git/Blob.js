import isNode from "detect-node";

import Ressource from "../Ressource";
import { getConfig } from "../../config";
import request from "../../api";

const _url = "/projects/:projectId/git/blobs/:sha";

export default class Blob extends Ressource {
  constructor(blob, url = _url, params, config) {
    super(url, {}, params, blob, [], [], config);

    this.id = "";
    this.type = "blob";
    this.path = "";
    this.sha = "";
    this.size = "";
    this.encoding = "";
    this.content = "";
  }

  static get(projectId, sha, config) {
    return super.get(
      `:api_url${_url}`,
      { projectId, sha },
      super.getConfig(config)
    );
  }

  async getInstance() {
    const blob = await Blob.get(
      this._params.projectId,
      this._params.sha,
      this.getConfig()
    );

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
      const config = this.getConfig();
      const blob = await Blob.get(
        this._params.projectId,
        this._params.sha,
        config
      );

      return blob.getRawContent(config);
    }

    if (this.encoding === "base64") {
      return this.decodeBase64();
    }

    throw new Error("Unrecognised blob encoding: " + this.encoding);
  }
}
