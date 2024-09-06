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
  id: string;
  created_at: string;
  updated_at: string;
  attributes: Record<string, unknown>;
  status: string;
  expires_at: string;
  index: string;
  commit_id: string;
  environment: string;
  safe: boolean;
  restorable: boolean;
  automated: boolean;
  size_of_volumes?: number;
  size_used?: number;

  constructor(environmentBackup: APIObject, url: string) {
    super(url, paramDefaults, {}, environmentBackup, [], []);

    this.id = environmentBackup.id;
    this.created_at = environmentBackup.created_at;
    this.updated_at = environmentBackup.updated_at;
    this.attributes = environmentBackup.attributes ?? {};
    this.status = environmentBackup.status;
    this.expires_at = environmentBackup.expires_at;
    this.index = environmentBackup.index;
    this.commit_id = environmentBackup.commit_id;
    this.environment = environmentBackup.environment;
    this.safe = environmentBackup.safe ?? true;
    this.restorable = environmentBackup.restorable;
    this.automated = environmentBackup.automated;
    this.size_of_volumes = environmentBackup.size_of_volumes;
    this.size_used = environmentBackup.size_used;
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
