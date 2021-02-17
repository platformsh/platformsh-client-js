import User from "./User";
import Ressource from "./Ressource";
import { getConfig } from "../config";

const url = "/platform/me";
const paramDefaults = {};
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

export default class Me extends User {
  constructor(account, config) {
    const { api_url } = config;
    super(account, `${api_url}${url}`, {}, config, modifiableField);

    this.projects = [];
    this.ssh_keys = [];
    this.roles = [];
    this.organizations = [];
    this.teams = [];
    this.picture = "";
    this.newsletter = "";
    this.plaintext = "";
    this.website = "";
    this.company_role = "";
    this.company_type = "";
    this.mail = "";
    this.trial = false;
  }

  static get(config) {
    return super.get({}, `:api_url${url}`, super.getConfig(config));
  }

  async update(data) {
    const conf = this.getConfig();

    const result = await super.update(
      data,
      `${conf.api_url}/platform/profiles/:id`
    );

    return new Me(result.data, conf); // Account API does not return a Result
  }
}
