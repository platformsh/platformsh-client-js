import atob from "atob";

import Ressource from "./Ressource";
import _urlParser from "../urlParser";
import { getConfig } from "../config";

const paramDefaults = {};
const url = "/v1/ssh_keys/:id";

export default class SshKey extends Ressource {
  constructor(sshKey) {
    const { id } = sshKey;
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, { id }, sshKey, [
      "title",
      "value"
    ]);
    this._required = ["value"];
    this._queryUrl = Ressource.getQueryUrl(`${api_url}${url}`);
    this.changed = "";
    this.id = "";
    this.title = "";
    this.key_id = 0;
    this.fingerprint = "";
    this.value = "";
  }

  static get(params) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get(`${api_url}${url}`, { id }, paramDefaults, queryParams);
  }

  /**
   * Override Ressource.save() so that it returns an SshKey and not a Result.
   *
   * @return object
   */
  async save() {
    let sshKey = await super.save();
    return new SshKey(sshKey.data);
  }

  /**
   * Override Ressource.getLink() so that it returns an SshKey and not a Result.
   *
   * @return string
   */
  getLink(rel, absolute = false) {
    if (rel === "#delete") {
      const { api_url } = getConfig();
      return _urlParser(`${api_url}${url}`, { id: this.key_id });
    }
    return super.getLink(rel, absolute);
  }

  /**
   * @inheritdoc
   */
  checkProperty(property, value) {
    const errors = {};

    if (property === "value" && !this.validatePublicKey(value)) {
      errors[property] = "The SSH key is invalid";
    }

    return errors;
  }

  /**
   * Validate an SSH public key.
   *
   * @param string value
   *
   * @return bool
   */
  validatePublicKey(value) {
    const filteredValue = value.replace(/\s+/, " ");

    if (filteredValue.indexOf(" ") === -1) {
      return false;
    }
    const match = value.split(" ", 3);
    const type = match[0];
    let key;

    try {
      key = atob(match[1]);
    } catch (err) {
      return false;
    }

    if (["ssh-rsa", "ssh-ed25519", "ssh-ecdsa"].indexOf(type) === -1 || !key) {
      return false;
    }
    return true;
  }
}
