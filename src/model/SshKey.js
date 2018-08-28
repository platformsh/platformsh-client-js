import atob from "atob";

import Ressource from "./Ressource";
import { getConfig } from "../config";

const paramDefaults = {};
const url = "/platform/ssh_keys/:id";

export default class SshKey extends Ressource {
  constructor(sshKey) {
    const { id } = sshKey;
    const { account_url } = getConfig();

    super(`${account_url}${url}`, paramDefaults, { id }, sshKey, [
      "title",
      "value"
    ]);
    this._required = ["value"];
    this._queryUrl = Ressource.getQueryUrl(`${account_url}${url}`);
    this.changed = "";
    this.id = "";
    this.title = "";
    this.key_id = 0;
    this.fingerprint = "";
    this.value = "";
  }

  static get(params) {
    const { id, ...queryParams } = params;
    const { account_url } = getConfig();

    return super.get(
      `${account_url}${url}`,
      { id },
      paramDefaults,
      queryParams
    );
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

    if (["ssh-rsa", "ssh-dsa"].indexOf(type) === -1 || !key) {
      return false;
    }
    return true;
  }
}
