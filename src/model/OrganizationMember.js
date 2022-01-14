import CursoredRessource from "./CursoredRessource";
import AuthUser from "./AuthUser";
import { getConfig } from "../config";

const paramDefaults = {};
const _url = "/organizations/:organizationId/members";

const creatableField = ["user_id", "permissions"];
const updatableField = ["permissions"];

export default class OrganizationMember extends CursoredRessource {
  constructor(organizationMember, url) {
    const { organizationId } = organizationMember;
    const { api_url } = getConfig();

    super(
      url || `${api_url}${_url}`,
      paramDefaults,
      { organizationId },
      organizationMember,
      creatableField,
      updatableField
    );
    this.id = "";
    this.user_id = "";
    this.organization_id = "";
    this.permissions = [];
    this.owner = false;
    this.created_at = "";
    this.updated_at = "";
  }

  static get(params = {}, customUrl) {
    const { organizationId, id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get(
      customUrl || `${api_url}${_url}/:id`,
      { organizationId, id },
      paramDefaults,
      queryParams
    );
  }

  static query(params, customUrl) {
    const { organizationId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super.query(
      customUrl || `${api_url}${_url}`,
      { organizationId },
      paramDefaults,
      queryParams
    );
  }

  delete() {
    return super.delete(this.getLink("delete"));
  }

  getUser() {
    return this.getRef("ref:users:0", AuthUser);
  }
}
