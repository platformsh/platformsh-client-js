import { APIObject } from "../Ressource";
import { getConfig } from "../../config";
import { autoImplementWithResources } from "../utils";

import { EnvironmentBackupsGetParams, EnvironmentBackupsQueryParams, BackupType } from "./types";

const paramDefaults = {};

const _url = "/projects/:projectId/environments/:environmentId/backups";

export default class EnvironmentBackup extends autoImplementWithResources()<BackupType>() {

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
}
