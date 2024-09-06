import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const _queryUrl = "/organizations/:organizationId/invitations";
const _url = `${_queryUrl}/:id`;

const creatableField = ["permissions", "email", "force"];

export default class OrganizationInvitation extends Ressource {
  id: string;
  owner: object;
  organization_id: string;
  permissions: any[];
  state: string;
  email: string;
  force: boolean;

  constructor(invitation: APIObject, url?: string) {
    const { organizationId, id } = invitation;
    const { api_url } = getConfig();

    super(
      url ?? `${api_url}${_url}`,
      {},
      { organizationId, id },
      invitation,
      creatableField,
      []
    );

    this._queryUrl = Ressource.getQueryUrl(this._url);

    this.id = id ?? "";
    this.owner = invitation.owner ?? {};
    this.organization_id = organizationId ?? "";
    this.permissions = invitation.permissions ?? [];
    this.state = invitation.state ?? "";
    this.email = invitation.email ?? "";
    this.force = invitation.force ?? false;
  }

  static async get(organizationId: string, id: string) {
    const { api_url } = getConfig();

    return super._get<OrganizationInvitation>(`${api_url}${_url}`, {
      id,
      organizationId
    });
  }

  static async query(organizationId: string) {
    const { api_url } = getConfig();

    return super._query<OrganizationInvitation>(
      `${api_url}${_queryUrl}`,
      { organizationId },
      {},
      {}
    );
  }

  static async getList(organizationId: string, queryParams = "") {
    const { api_url } = getConfig();

    return super._query<OrganizationInvitation>(
      `${api_url}${_queryUrl}?${queryParams}`,
      { organizationId },
      {},
      {}
    );
  }

  async delete() {
    const { api_url } = getConfig();

    return super.delete(
      `${api_url}/organizations/${this.organization_id}/invitations/${this.id}`
    );
  }
}
