import request from "../api";
import { getConfig } from "../config";

import Organization from "./Organization";
import type Project from "./Project";
import type { APIObject } from "./Ressource";
import Result from "./Result";
import type SshKey from "./SshKey";
import type Team from "./Team";
import User from "./User";

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

export type PhoneVerificationResponse = {
  verify_phone: boolean;
};

// @ts-expect-error fix the get method inheritance error
export default class Me extends User {
  projects: Project[];
  ssh_keys: SshKey[];
  roles: string[];
  teams: Team[];
  picture: string;
  newsletter: boolean;
  plaintext: boolean;
  website: string;
  company_role: string;
  company_type: string;
  mail: string;
  trial: boolean;
  uuid: string;
  current_trial: object;

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
    this.current_trial = {};
  }

  static async get(reset = false) {
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

  async update(data: APIObject) {
    const { api_url } = getConfig();

    const result = await super.update(data, `${api_url}/platform/profiles/:id`);

    return new Result(new Me(result.data)); // Account API does not return a Result
  }

  async phone(refresh = false): Promise<PhoneVerificationResponse> {
    const { api_url } = getConfig();

    const params = refresh ? "force_refresh=1" : "";
    return request(`${api_url}${url}/phone?${params}`, "POST");
  }

  async getOrganizations() {
    return this.getRefs<Organization>("ref:organizations", Organization);
  }
}
