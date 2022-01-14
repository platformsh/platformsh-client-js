import Ressource from "./Ressource";
import { getConfig } from "../config";
import request from "../api";

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

export default class Invitation extends Ressource {
  constructor(invitation, url) {
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

    this._queryUrl = Ressource.getQueryUrl(this._url);

    this.id = "";
    this.owner = {};
    this.projectId = "";
    this.environments = []; // This field is deprecated, use permissions instead
    this.permissions = [];
    this.state = "";
    this.email = "";
    this.role = "";
    this.force = false;
  }

  static get(projectId, id) {
    const { api_url } = getConfig();

    return super._get(`${api_url}${_url}`, { id, projectId });
  }

  static query(projectId) {
    const { api_url } = getConfig();

    return super._query(`${api_url}${_queryUrl}`, { projectId }, {}, {}, data =>
      data.map(d => ({ projectId, ...d }))
    );
  }

  delete() {
    return request(this._url, "DELETE");
  }
}
