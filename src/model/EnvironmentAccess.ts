import { getConfig } from "../config";

import Account from "./Account";
import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";
import User from "./User";

const paramDefaults = {};

const ROLE_ADMIN = "admin";
const ROLE_VIEWER = "viewer";
const ROLE_CONTRIBUTOR = "contributor";

const roles = [ROLE_ADMIN, ROLE_VIEWER, ROLE_CONTRIBUTOR];

const creatableField = ["user", "role", "email"];
const modifiableField = ["role"];
const _url = "/projects/:projectId/environments/:environmentId/access";

export type EnvironmentAccessGetParams = {
  [key: string]: any;
  projectId: string;
  environmentId: string;
  id: string;
};

export type EnvironmentAccessQueryParams = {
  [key: string]: any;
  projectId: string;
  environmentId: string;
};

export default class EnvironmentAccess extends Ressource {
  id = "";
  user = "";
  email = "";
  role = "";
  project? = "";
  environment? = "";

  constructor(environmentAccess: APIObject, url: string) {
    super(
      url,
      paramDefaults,
      {},
      environmentAccess,
      creatableField,
      modifiableField
    );

    this._required = ["role"];
  }

  static async get(params: EnvironmentAccessGetParams, customUrl?: string) {
    const { projectId, environmentId, id, ...queryParams } = params;
    const { api_url } = getConfig();
    const urlToCall = customUrl ? `${customUrl}/:id` : `${api_url}${_url}/:id`;

    return super._get<EnvironmentAccess>(
      urlToCall,
      { id, projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }

  static async query(params: EnvironmentAccessQueryParams, customUrl?: string) {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query<EnvironmentAccess>(
      customUrl ?? `${api_url}${_url}`,
      { projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }

  async update(access: EnvironmentAccess) {
    return super.update(access);
  }

  /**
   * @inheritdoc
   */
  checkProperty(property: string, value: string) {
    const errors: Record<string, string> = {};

    if (property === "role" && !roles.includes(value)) {
      errors[property] = `Invalid environment role: '${value}'`;
    }
    return errors;
  }

  /**
   * {@inheritdoc}
   */
  getLink(rel: string, absolute = true) {
    if (rel === "#edit" && !this.hasLink(rel)) {
      return this.getUri(absolute);
    }
    return super.getLink(rel, absolute);
  }

  /**
   * Get the account information for this user.
   *
   * @throws \Exception
   *
   * @return Result
   */
  async getAccount() {
    return Account.get({ id: this.id }).then(account => {
      if (!account) {
        throw new Error(`Account not found for user: ${this.id}`);
      }
      return account;
    });
  }

  /**
   * Get the user
   *
   * @throws \Exception
   *
   * @return User
   */
  getUser() {
    const embeddedUsers = this.getEmbedded("users");

    if (embeddedUsers) {
      return new User(embeddedUsers[0]);
    }
  }
}
