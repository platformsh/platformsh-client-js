import Ressource, { APIObject } from "./Ressource";
import Account from "./Account";
import User from "./User";
import { getConfig } from "../config";

const paramDefaults = {};

const ROLE_ADMIN = "admin";
const ROLE_VIEWER = "viewer";
const ROLE_CONTRIBUTOR = "contributor";

const roles = [ROLE_ADMIN, ROLE_VIEWER, ROLE_CONTRIBUTOR];

const creatableField = ["user", "role", "email"];
const modifiableField = ["role"];
const _url = "/projects/:projectId/environments/:environmentId/access";

export interface EnvironmentAccessGetParams {
  projectId: string;
  environmentId: string;
  id: string;
  [key: string]: any;
};

export interface EnvironmentAccessQueryParams {
  projectId: string;
  environmentId: string;
  [key: string]: any;
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

  static get(params: EnvironmentAccessGetParams, customUrl?: string) {
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

  static query(params: EnvironmentAccessQueryParams, customUrl?: string) {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query<EnvironmentAccess>(
      customUrl || `${api_url}${_url}`,
      { projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }

  update(access: EnvironmentAccess) {
    return super.update(access);
  }

  /**
   * @inheritdoc
   */
  checkProperty(property: string, value: string) {
    const errors: Record<string, string> = {};

    if (property === "role" && roles.indexOf(value) === -1) {
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
  getAccount() {
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

    if(embeddedUsers) {
      return new User(embeddedUsers[0]);
    }
  }
}
