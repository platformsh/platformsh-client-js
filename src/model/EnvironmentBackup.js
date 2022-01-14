import Ressource from "./Ressource";
import { getConfig } from "../config";

const paramDefaults = {};

const creatableField = [];
const modifiableField = [];
const _url = "/projects/:projectId/environments/:environmentId/backups";
const _postUrl = "/projects/:projectId/environments/:environmentId/backup";

export default class EnvironmentBackup extends Ressource {
  constructor(environmentBackup, url) {
    super(
      url,
      paramDefaults,
      {},
      environmentBackup,
      creatableField,
      modifiableField
    );
    this.id = "";
    this.created_at = "";
    this.updated_at = "";
    this.attributes = {};
    this.status = "";
    this.expires_at = "";
    this.index = "";
    this.commit_id = "";
    this.environment = "";
    this._required = [];
  }

  static get(params, customUrl) {
    const { projectId, environmentId, id, ...queryParams } = params;
    const { api_url } = getConfig();
    const urlToCall = customUrl ? `${customUrl}/:id` : `${api_url}${_url}/:id`;

    return super._get(
      urlToCall,
      { id, projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }

  static query(params, customUrl) {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query(
      customUrl || `${api_url}${_url}`,
      { projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }
}
