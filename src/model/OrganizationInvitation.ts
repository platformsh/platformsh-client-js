import Ressource, { APIObject } from "./Ressource";
import { getConfig } from "../config";

const _queryUrl = "/organizations/:organizationId/invitations";
const _url = `${_queryUrl}/:id`;

const creatableField = ["permissions", "email", "force"];

export default class OrganizationInvitation extends Ressource {
  id: string;
  owner: object;
  organization_id: string;
  permissions: Array<any>;
  state: string;
  email: string;
  force: boolean;

  constructor(invitation: APIObject, url?: string) {
    const { organizationId, id } = invitation;
    const { api_url } = getConfig();

    super(
      url || `${api_url}${_url}`,
      {},
      { organizationId, id },
      invitation,
      creatableField,
      []
    );

    this._queryUrl = Ressource.getQueryUrl(this._url);

    this.id = "";
    this.owner = {};
    this.organization_id = "";
    this.permissions = [];
    this.state = "";
    this.email = "";
    this.force = false;
  }

  static get(organizationId: string, id: string) {
    const { api_url } = getConfig();

    return super._get<OrganizationInvitation>(`${api_url}${_url}`, {
      id,
      organizationId,
    });
  }

  static query(organizationId: string) {
    const { api_url } = getConfig();

    return super._query<OrganizationInvitation>(
      `${api_url}${_queryUrl}`,
      { organizationId },
      {},
      {}
    );
  }

  static getList(organizationId: string, queryParams = "") {
    const { api_url } = getConfig();

    return super._query<OrganizationInvitation>(
      `${api_url}${_queryUrl}?${queryParams}`,
      { organizationId },
      {},
      {}
    );
  }

  delete() {
    const { api_url } = getConfig();

    return super.delete(
      `${api_url}/organizations/${this.organization_id}/invitations/${this.id}`
    );
  }
}
