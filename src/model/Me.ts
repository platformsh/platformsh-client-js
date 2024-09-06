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

export type KYCVerificationResponse = {
  state: boolean;
  type: "credit-card" | "phone" | "ticket" | null;
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
  stripe?: {
    public_key: string;
  };

  constructor(account: APIObject) {
    const { api_url } = getConfig();
    super(account, `${api_url}${url}`, modifiableField);

    this.projects = account.projects ?? [];
    this.ssh_keys = account.ssh_keys ?? [];
    this.roles = account.roles ?? [];
    this.teams = account.teams ?? [];
    this.picture = account.picture;
    this.newsletter = account.newsletter;
    this.plaintext = account.plaintext;
    this.website = account.website;
    this.company_role = account.company_role;
    this.company_type = account.company_type;
    this.mail = account.mail;
    this.trial = account.trial;
    this.uuid = account.uuid;
    this.current_trial = account.current_trial ?? {};
    this.stripe = account.stripe ?? {
      public_key: ""
    };
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

  // Deprecated
  // remove after the next release
  async phone(refresh = false): Promise<PhoneVerificationResponse> {
    const { api_url } = getConfig();

    const params = refresh ? "force_refresh=1" : "";
    return request(`${api_url}${url}/phone?${params}`, "POST");
  }

  async kycVerification(refresh = false): Promise<KYCVerificationResponse> {
    const { api_url } = getConfig();

    const params = refresh ? "force_refresh=1" : "";
    return request(`${api_url}${url}/verification?${params}`, "POST");
  }

  async getOrganizations() {
    return this.getRefs<Organization>("ref:organizations", Organization);
  }
}
