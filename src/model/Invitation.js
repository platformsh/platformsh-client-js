import Ressource from "./Ressource";
import { getConfig } from "../config";
import request from "../api";

const _queryUrl = "/projects/:projectId/invitations";
const _url = `${_queryUrl}/:id`;

const creatableField = ["projectId", "environments", "role", "email", "force"];

export default class Invitation extends Ressource {
  constructor(invitation, url, params, config) {
    const { projectId, id } = invitation;

    super(
      url || `:api_url${_url}`,
      {},
      { projectId, id },
      invitation,
      creatableField,
      [],
      config
    );

    this._queryUrl = Ressource.getQueryUrl(this._url);

    this.id = "";
    this.owner = {};
    this.projectId = "";
    this.environments = [];
    this.state = "";
    this.email = "";
    this.role = "";
    this.force = false;
  }

  static get(projectId, id, config) {
    return super.get(
      `:api_url${_url}`,
      { id, projectId },
      super.getConfig(config)
    );
  }

  static query(projectId, config) {
    return super.query(
      `:api_url${_queryUrl}`,
      { projectId },
      super.getConfig(config),
      {},
      data => data.map(d => ({ projectId, ...d }))
    );
  }

  delete() {
    return request(this._url, "DELETE", {}, this.getConfig());
  }
}
