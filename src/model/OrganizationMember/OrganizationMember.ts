import CursoredRessource from "../CursoredRessource";
import AuthUser from "../AuthUser";
import { getConfig } from "../../config";
import { APIObject } from "../Ressource";

import { autoImplementWithResources } from "../utils";
import { OrganizationMemberType, OrganizationMemberGetParams, OrganizationMemberQueryParams } from "./types";

const paramDefaults = {};
const _url = "/organizations/:organizationId/members";

const creatableField = ["user_id", "permissions"];
const updatableField = ["permissions"];

export default class OrganizationMember extends autoImplementWithResources()<Omit<OrganizationMemberType, "_links">>() {
  constructor(organizationMember: APIObject, url?: string) {
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
  }

  static get(params: OrganizationMemberGetParams, customUrl?: string) {
    const { organizationId, id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<OrganizationMember>(
      customUrl || `${api_url}${_url}/:id`,
      { organizationId, id },
      paramDefaults,
      queryParams
    );
  }

  static query(params: OrganizationMemberQueryParams, customUrl?: string) {
    const { organizationId, ...queryParams } = params;
    const { api_url } = getConfig();

    return CursoredRessource.queryCursoredResult<OrganizationMember>(
      customUrl || `${api_url}${_url}`,
      { organizationId },
      paramDefaults,
      queryParams,
      OrganizationMember
    );
  }

  delete() {
    return super.delete(this.getLink("delete"));
  }

  getUser() {
    return this.getRef("ref:users:0", AuthUser);
  }
}
