import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const paramDefaults = {};

const _url = "/projects/:projectId/environments/:environmentId/backups";

export type EnvironmentBackupsGetParams = {
  [key: string]: any;
  projectId: string;
  environmentId: string;
  id: string;
};

export type EnvironmentBackupsQueryParams = {
  [key: string]: any;
  projectId: string;
  environmentId: string;
};

export type EnvironmentBackupsRestoreBody = {
  environment_name: string;
  branch_from: string;
  restore_code: boolean;
};

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
  restorable = false;
  automated = false;

  constructor(environmentBackup: APIObject, url: string) {
    super(url, paramDefaults, {}, environmentBackup, [], []);
  }

  static async get(params: EnvironmentBackupsGetParams, customUrl?: string) {
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

  static async query(
    params: EnvironmentBackupsQueryParams,
    customUrl?: string
  ) {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query<EnvironmentBackup>(
      customUrl ?? `${api_url}${_url}`,
      { projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }

  async restore(body: EnvironmentBackupsRestoreBody) {
    return this.runLongOperation("restore", "POST", body);
  }
}
