import request from "../api";
import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

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
  id: string;
  owner: any;
  projectId: string;
  environments: any[]; // This field is deprecated, use permissions instead
  permissions: any[];
  state: string;
  email: string;
  role: string;
  force: boolean;

  constructor(invitation: APIObject, url?: string) {
    const { projectId, id } = invitation;
    const { api_url } = getConfig();

    super(
      url ?? `${api_url}${_url}`,
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

  static async get(projectId: string, id: string) {
    const { api_url } = getConfig();

    return super._get<Invitation>(`${api_url}${_url}`, { id, projectId });
  }

  static async query(projectId: string) {
    const { api_url } = getConfig();

    return super._query<Invitation>(
      `${api_url}${_queryUrl}`,
      { projectId },
      {},
      {},
      data => {
        if (Array.isArray(data)) {
          return data.map(d => ({ projectId, ...d }));
        }
        return [];
      }
    );
  }

  async delete() {
    return request(this._url, "DELETE");
  }
}
