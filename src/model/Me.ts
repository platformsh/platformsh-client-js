import User from "./User";
import { APIObject } from "./Ressource";
import { getConfig } from "../config";
import request from "../api";
import Organization from "./Organization";
import Project from "./Project";
import SshKey from "./SshKey";
import Result from "./Result";
import Team from "./Team";

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

export interface PhoneVerificationResponse {
  verify_phone: boolean;
}

// @ts-ignore
// TODO: fix the get method inheritance error
export default class Me extends User {
  projects: Array<Project>;
  ssh_keys: Array<SshKey>;
  roles: Array<string>;
  teams: Array<Team>;
  picture: string;
  newsletter: boolean;
  plaintext: boolean;
  website: string;
  company_role: string;
  company_type: string;
  mail: string;
  trial: boolean;
  uuid: string;

  constructor(account: APIObject) {
    const { api_url } = getConfig();
    super(account, `${api_url}${url}`, modifiableField);

    this.projects = [];
    this.ssh_keys = [];
    this.roles = [];
    this.teams = [];
    this.picture = "";
    this.newsletter = false;
    this.plaintext = false;
    this.website = "";
    this.company_role = "";
    this.company_type = "";
    this.mail = "";
    this.trial = false;
    this.uuid = "";
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

  phone(refresh: boolean = false): Promise<PhoneVerificationResponse> {
    const { api_url } = getConfig();

    const params = refresh ? "force_refresh=1" : "";
    return request(`${api_url}${url}/phone?${params}`, "POST");
  }

  getOrganizations() {
    return this.getRefs<Organization>("ref:organizations", Organization);
  }
}
