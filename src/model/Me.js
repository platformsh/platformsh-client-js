import User from "./User";
import Ressource from "./Ressource";
import { getConfig } from "../config";

const url = "/platform/me";
const paramDefaults = {};
const modifiableField = ["picture"];

export default class Me extends User {
  constructor(account) {
    const { api_url } = getConfig();
    super(account, `${api_url}${url}`, modifiableField);

    this.projects = [];
    this.ssh_keys = [];
    this.organizations = [];
    this.teams = [];
    this.picture = "";
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
