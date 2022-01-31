import Ressource, { APIObject } from "./Ressource";
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

  id: string;
  owner: any;
  projectId: string;
  environments: Array<any>; // This field is deprecated, use permissions instead
  permissions: Array<any>;
  state: string;
  email: string;
  role: string;
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
