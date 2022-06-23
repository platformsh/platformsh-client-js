import { APIObject } from "../Ressource";
import { getConfig } from "../../config";
import Organization from "../Organization";
import Result from "../Result";
import { autoImplementWithResources } from "../utils";

import { CurrentUserType } from "./types";

const url = "/platform/me";
const modifiableField = [
  "picture",
  "mail",
  "display_name",
  "username",
  "newsletter",
  "plaintext",
  "company_role",
  "company_type",
  "website",
  "ssh_keys"
];

// @ts-ignore
// TODO: fix the get method inheritance error
export default class Me extends autoImplementWithResources()<CurrentUserType>() {

  constructor(account: APIObject) {
    const { api_url } = getConfig();
    super(`${api_url}${url}`, {}, {}, account, [], modifiableField);
  }

  static get(reset = false) {
    const { api_url } = getConfig();

    return super._get<Me>(
      `${api_url}${url}`,
      {},
      {},
      {},
      {
        cache: reset ? "reload" : "default"
      }
    );
  }

  async update(data: APIObject, _url?: string) {
    const { api_url } = getConfig();

    const result = await super.update(data, `${api_url}/platform/profiles/:id`);

    return new Result(new Me(result.data)); // Account API does not return a Result
  }

  getOrganizations() {
    return this.getRefs<Organization>("ref:organizations", Organization);
  }
}
