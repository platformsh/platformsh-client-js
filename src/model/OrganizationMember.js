import Ressource from "./Ressource";
import { getConfig } from "../config";

const paramDefaults = {};
const _url = "/organizations/:organizationId/members";

const creatableField = ["user", "role"];

export default class OrganizationMember extends Ressource {
  constructor(organizationMember, url, params, config) {
    const { organizationId } = organizationMember;

    super(
      url || `:api_url${_url}`,
      paramDefaults,
      { organizationId },
      organizationMember,
      creatableField,
      creatableField,
      config
    );
    this.user = ""; // User id
    this.role = "";
    this.organizationId = "";
  }

  static get(params = {}, customUrl, config) {
    const { organizationId, id, ...queryParams } = params;

    return super.get(
      customUrl || `:api_url}${_url}/:id`,
      { organizationId, id },
      super.getConfig(config),
      queryParams
    );
  }

  static query(params, customUrl, config) {
    const { organizationId, ...queryParams } = params;

    return super.query(
      customUrl || `:api_url${_url}`,
      { organizationId },
      super.getConfig(config),
      queryParams
    );
  }
}
