import Ressource, { APIObject } from "../Ressource";
import { getConfig } from "../../config";
import request from "../../api";
import { autoImplementWithResources } from "../utils";

import { ProjectInvitationType } from "./types";

const _queryUrl = "/projects/:projectId/invitations";
const _url = `${_queryUrl}/:id`;

const creatableField = [
  "projectId",
  "environments",
  "permissions",
  "role",
  "email",
  "force"
];

export default class Invitation extends autoImplementWithResources()<ProjectInvitationType>() {

  permissions: Array<any>;
  force: boolean;

  constructor(invitation: APIObject, url?: string) {
    const { projectId, id } = invitation;
    const { api_url } = getConfig();

    super(
      url || `${api_url}${_url}`,
      {},
      { projectId, id },
      invitation,
      creatableField,
      []
    );

    this.permissions = invitation.permissions;
    this.force = invitation.force;
    this._queryUrl = Ressource.getQueryUrl(this._url);
  }

  static get(projectId: string, id: string) {
    const { api_url } = getConfig();

    return super._get<Invitation>(`${api_url}${_url}`, { id, projectId });
  }

  static query(projectId: string) {
    const { api_url } = getConfig();

    return super._query<Invitation>(`${api_url}${_queryUrl}`, { projectId }, {}, {}, data => {
      if(Array.isArray(data)) {
        return data.map(d => ({ projectId, ...d }))
      }
      return [];
    });
  }

  delete() {
    return request(this._url, "DELETE");
  }
}
