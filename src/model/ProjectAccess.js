import emailValidator from "email-validator";

import Ressource from "./Ressource";
import Account from "./Account";
import User from "./User";
import { getConfig } from "../config";

const paramDefaults = {};

const ROLE_ADMIN = "admin";
const ROLE_VIEWER = "viewer";

const roles = [ROLE_ADMIN, ROLE_VIEWER];
const createField = ["role", "user", "email"];
const modifiableField = ["role"];
const _url = "/projects/:projectId/access";

export default class ProjectAccess extends Ressource {
  constructor(projectAccess, url) {
    super(url, paramDefaults, {}, projectAccess, createField, modifiableField);
    this._required = ["email"];
    this.id = "";
    this.role = "";
    this.user = "";
  }

  static query(params = {}, customUrl) {
    const { projectId } = params;
    const { api_url } = getConfig();

    return super._query(customUrl || `${api_url}${_url}`, { projectId });
  }

  /**
   * Get the account information for this user.
   *
   * @throws \Exception
   *
   * @return Result
   */
  getAccount() {
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
    const embeddedUsers = this.getEmbedded("users");

    return new User(embeddedUsers[0]);
  }

  /**
   * @inheritdoc
   */
  checkProperty(property, value) {
    let errors = {};

    if (property === "email" && !emailValidator.validate(value)) {
      errors[property] = `Invalid email address: '${value}'`;
    } else if (property === "role" && roles.indexOf(value) === -1) {
      errors[property] = `Invalid role: '${value}'`;
    }
    return errors;
  }
}
