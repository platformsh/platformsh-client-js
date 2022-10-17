import Ressource, { APIObject } from "./Ressource";
import { getConfig } from "../config";

const paramDefaults = {};

const _url = "/projects/:projectId/environments/:environmentId/backups";

export interface EnvironmentBackupsGetParams {
  projectId: string;
  environmentId: string;
  id: string;
  [key: string]: any;
};

export interface EnvironmentBackupsQueryParams {
  projectId: string;
  environmentId: string;
  [key: string]: any;
};

export interface EnvironmentBackupRestoreParams {
  environment_name: string;
  branch_from: string;
  restore_code: boolean;
}

export default class EnvironmentBackup extends Ressource {
  id = "";
  created_at = "";
  updated_at = "";
  attributes = {};
  status = "";
  expires_at = "";
  index = "";
  commit_id = "";
  environment = "";
  safe = true;

  constructor(environmentBackup: APIObject, url: string) {
    super(
      url,
      paramDefaults,
      {},
      environmentBackup,
      [],
      []
    );
  }

  static get(params: EnvironmentBackupsGetParams, customUrl?: string) {
    const { projectId, environmentId, id, ...queryParams } = params;
    const { api_url } = getConfig();
    const urlToCall = customUrl ? `${customUrl}/:id` : `${api_url}${_url}/:id`;

    return super._get<EnvironmentBackup>(
      urlToCall,
      { id, projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }

  static query(params: EnvironmentBackupsQueryParams, customUrl?: string) {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query<EnvironmentBackup>(
      customUrl || `${api_url}${_url}`,
      { projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }

  restore(params: EnvironmentBackupRestoreParams) {
    return this.runLongOperation("restore", "POST", params);
  }
}
