import Ressource from "./Ressource";
import { getConfig } from "../config";
import request from "../api";

const _url = "/projects/:projectId/invitations";

const creatableField = ["projectId", "environments", "role", "email"];

export default class Invitation extends Ressource {
  constructor(invitation, url) {
    const { projectId } = invitation;
    const { api_url } = getConfig();

    super(
      url || `${api_url}${_url}`,
      {},
      { projectId },
      invitation,
      creatableField,
      []
    );

    this.id = "";
    this.projectId = "";
    this.environments = [];
    this.state = "";
    this.email = "";
    this.role = "";
  }

  static get(projectId, id) {
    const { api_url } = getConfig();

    return super.get(`${api_url}${_url}/:id`, { id, projectId });
  }

  static query(projectId) {
    const { api_url } = getConfig();

    return super.query(`${api_url}${_url}`, { projectId }, {}, {}, data =>
      data.map(d => ({ projectId: d.projectId, ...d }))
    );
  }

  delete() {
    return request(this._url, "DELETE");
  }
}
