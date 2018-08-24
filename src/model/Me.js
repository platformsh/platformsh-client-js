import User from "./User";
import Ressource from "./Ressource";
import { getConfig } from "../config";

const url = "/platform/me";
const paramDefaults = {};
const modifiableField = [
  "picture",
  "email",
  "display_name",
  "username",
  "newsletter",
  "plaintext",
  "company_role",
  "company_type",
  "website"
];

export default class Me extends User {
  constructor(account) {
    const { api_url } = getConfig();
    super(account, `${api_url}${url}`, modifiableField);

    this.projects = [];
    this.ssh_keys = [];
    this.organizations = [];
    this.teams = [];
    this.picture = "";
    this.newsletter = "";
    this.plaintext = "";
    this.website = "";
    this.company_role = "";
    this.company_type = "";
  }

  static get() {
    const { api_url } = getConfig();

    return super.get({}, `${api_url}${url}`);
  }

  async update(data) {
    const { api_url } = getConfig();

    const result = await super.update(data, `${api_url}/platform/profiles/:id`);

    return new Me(result.data); // Account API does not return a Result
  }
}
