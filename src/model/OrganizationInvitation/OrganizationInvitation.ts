import Ressource, { APIObject } from "../Ressource";
import { getConfig } from "../../config";
import { autoImplementWithResources } from "../utils";

import { OrganizationInvitationType } from "./types";

const _queryUrl = "/organizations/:organizationId/invitations";
const _url = `${_queryUrl}/:id`;

const creatableField = ["permissions", "email", "force"];

export default class OrganizationInvitation extends autoImplementWithResources()<OrganizationInvitationType>() {
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

    this.force = invitation.force;
    this._queryUrl = Ressource.getQueryUrl(this._url);
  }

  static get(organizationId: string, id: string) {
    const { api_url } = getConfig();

    return super._get<OrganizationInvitation>(`${api_url}${_url}`, { id, organizationId });
  }

  static query(organizationId: string) {
    const { api_url } = getConfig();

    return super._query<OrganizationInvitation>(`${api_url}${_queryUrl}`, { organizationId }, {}, {});
  }

  delete() {
    return super.delete(this._url);
  }
}
