import Ressource from "./Ressource";
import { getConfig } from "../config";
import ProjectAccess from "./ProjectAccess";

import request from "../api";

const url = "/projects/:projectId/environment-types/:id";
const paramDefaults = {};

export default class EnvironmentType extends Ressource {
  constructor(account) {
    const { id } = account;
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, { id }, account);
    this.id = "";
    this.access = {};
  }

  static get(params, customUrl) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super.get(
      customUrl || `${api_url}${url}`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static query(params) {
    const { api_url } = getConfig();
    const { projectId, ...queryString } = params;

    return super.query(
      this.getQueryUrl(`${api_url}${url}`),
      { projectId },
      paramDefaults,
      queryString
    );
  }

  async getAccess() {
    const accessLink = this.getLink("#access");
    const access = await request(accessLink);
    this.access = new ProjectAccess(access, accessLink);
    return this.access;
  }
}
