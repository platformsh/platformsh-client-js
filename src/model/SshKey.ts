import atob from "atob";

import { getConfig } from "../config";
import _urlParser from "../urlParser";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const paramDefaults = {};
const url = "/v1/ssh_keys/:id";

export type SshKeyGetParams = {
  [key: string]: any;
  id: string;
};

export default class SshKey extends Ressource {
  changed: string;
  id: string;
  title: string;
  key_id: string;
  fingerprint: string;
  value: string;

  constructor(sshKey: APIObject) {
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
    this.key_id = "";
    this.fingerprint = "";
    this.value = "";
  }

  static async get(params: SshKeyGetParams) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<SshKey>(
      `${api_url}${url}`,
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
  // @ts-expect-error fix inheritance error
  async save() {
    const sshKey = await super.save();
    return new SshKey(sshKey.data);
  }

  /**
   * Override Ressource.getLink() so that it returns an SshKey and not a Result.
   *
   * @return string
   */
  getLink(rel: string, absolute = false) {
    if (rel === "#delete") {
      const { api_url } = getConfig();
      return _urlParser(`${api_url}${url}`, { id: this.key_id });
    }
    return super.getLink(rel, absolute);
  }

  /**
   * @inheritdoc
   */
  checkProperty(property: string, value: string) {
    const errors: Record<string, string> = {};

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
  validatePublicKey(value: string) {
    const filteredValue = value.replace(/\s+/u, " ");

    if (!filteredValue.includes(" ")) {
      return false;
    }
    const match = value.split(" ", 3);
    const [type] = match;
    let key;

    try {
      key = atob(match[1]);
    } catch (err) {
      return false;
    }

    if (!["ssh-rsa", "ssh-ed25519", "ssh-ecdsa"].includes(type) || !key) {
      return false;
    }
    return true;
  }
}
