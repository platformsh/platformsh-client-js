import atob from "atob";

import Ressource, { APIObject } from "../Ressource";
import _urlParser from "../../urlParser";
import { getConfig } from "../../config";
import { autoImplementWithResources } from "../utils";

import { SshKeyType, SshKeyGetParams} from "./types";


const paramDefaults = {};
const url = "/v1/ssh_keys/:id";

export default class SshKey extends autoImplementWithResources()<SshKeyType>() {

  constructor(sshKey: APIObject) {
    const { id } = sshKey;
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, { id }, sshKey, [
      "title",
      "value"
    ]);
    this._required = ["value"];
    this._queryUrl = Ressource.getQueryUrl(`${api_url}${url}`);
  }

  static get(params: SshKeyGetParams) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<SshKey>(`${api_url}${url}`, { id }, paramDefaults, queryParams);
  }

  /**
   * Override Ressource.save() so that it returns an SshKey and not a Result.
   *
   * @return object
   */
  // @ts-ignore
  // TODO: fix inheritance error
  async save() {
    let sshKey = await super.save();
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
      if(this.key_id) {
        return _urlParser(`${api_url}${url}`, { id: this.key_id.toString() });
      }
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
