import { getConfig } from "../config";

import AuthUser from "./AuthUser";
import CursoredRessource from "./CursoredRessource";
import type { APIObject } from "./Ressource";

const paramDefaults = {};
const _url = "/organizations/:organizationId/members";

const creatableField = ["user_id", "permissions"];
const updatableField = ["permissions"];

export type OrganizationMemberGetParams = {
  [key: string]: any;
  id: string;
  organizationId: string;
};

export type OrganizationMemberQueryParams = {
  [key: string]: any;
  organizationId: string;
};

export default class OrganizationMember extends CursoredRessource {
  id: string;
  user_id: string;
  organization_id: string;
  permissions: any[];
  owner: boolean;
  created_at: string;
  updated_at: string;

  constructor(organizationMember: APIObject, url?: string) {
    const { organizationId } = organizationMember;
    const { api_url } = getConfig();

    super(
      url ?? `${api_url}${_url}`,
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

  static async get(params: OrganizationMemberGetParams, customUrl?: string) {
    const { organizationId, id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<OrganizationMember>(
      customUrl ?? `${api_url}${_url}/:id`,
      { organizationId, id },
      paramDefaults,
      queryParams
    );
  }

  static async query(
    params: OrganizationMemberQueryParams,
    customUrl?: string
  ) {
    const { organizationId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super.queryCursoredResult<OrganizationMember>(
      customUrl ?? `${api_url}${_url}`,
      { organizationId },
      paramDefaults,
      queryParams,
      OrganizationMember
    );
  }

  async delete() {
    return super.delete(this.getLink("delete"));
  }

  async getUser() {
    return this.getRef("ref:users:0", AuthUser);
  }
}
