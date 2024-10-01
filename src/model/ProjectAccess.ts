import emailValidator from "email-validator";

import { getConfig } from "../config";

import { Account } from "./Account";
import type { EnvironmentAccessRole } from "./EnvironmentAccess";
import type { APIObject } from "./Ressource";
import { Ressource } from "./Ressource";
import { User } from "./User";

const paramDefaults = {};

const ROLE_ADMIN = "admin";
const ROLE_VIEWER = "viewer";

const roles = [ROLE_ADMIN, ROLE_VIEWER];
const createField = ["role", "user", "email"];
const modifiableField = ["role"];
const _url = "/projects/:projectId/access";

export type ProjectAccessQueryParams = {
  [key: string]: any;
  projectId: string;
};

export type ProjectAccessEnvironmentType =
  | "production"
  | "development"
  | "staging";

export class ProjectAccess extends Ressource {
  id: string;
  email: string;
  role: EnvironmentAccessRole;
  user: string;

  constructor(projectAccess: APIObject, url: string) {
    super(url, paramDefaults, {}, projectAccess, createField, modifiableField);
    this._required = ["email"];
    this.id = projectAccess.id;
    this.email = projectAccess.email;
    this.role = projectAccess.role;
    this.user = projectAccess.user;
  }

  static async query(params: ProjectAccessQueryParams, customUrl?: string) {
    const { projectId } = params;
    const { api_url } = getConfig();

    return super._query<ProjectAccess>(customUrl ?? `${api_url}${_url}`, {
      projectId
    });
  }

  /**
   * Get the account information for this user.
   *
   * @throws \Exception
   *
   * @return Result
   */
  async getAccount() {
    return Account.get({ id: this.user }).then(account => {
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
    const embeddedUsers = this.getEmbedded("users")!;

    return new User(embeddedUsers[0]);
  }

  /**
   * @inheritdoc
   */
  checkProperty(property: string, value: string) {
    const errors: Record<string, string> = {};

    if (property === "email" && !emailValidator.validate(value)) {
      errors[property] = `Invalid email address: '${value}'`;
    } else if (property === "role" && !roles.includes(value)) {
      errors[property] = `Invalid role: '${value}'`;
    }
    return errors;
  }
}
