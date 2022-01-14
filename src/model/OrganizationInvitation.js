import Ressource from "./Ressource";
import { getConfig } from "../config";
import request from "../api";

const _queryUrl = "/organizations/:organizationId/invitations";
const _url = `${_queryUrl}/:id`;

const creatableField = ["permissions", "email", "force"];

export default class OrganizationInvitation extends Ressource {
  constructor(invitation, url) {
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

  static get(organizationId, id) {
    const { api_url } = getConfig();

    return super._get(`${api_url}${_url}`, { id, organizationId });
  }

  static query(organizationId) {
    const { api_url } = getConfig();

    return super._query(`${api_url}${_queryUrl}`, { organizationId }, {}, {});
  }

  delete() {
    return request(this._url, "DELETE");
  }
}
