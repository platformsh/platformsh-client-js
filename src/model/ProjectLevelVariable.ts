import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const paramDefaults = {
  id: "name"
};
const creatableField = [
  "name",
  "value",
  "is_json",
  "is_sensitive",
  "visible_build",
  "visible_runtime"
];
const modifiableField = [
  "value",
  "is_json",
  "is_sensitive",
  "visible_build",
  "visible_runtime"
];

const _url = "/projects/:projectId/variables";

export type ProjectLevelVariableGetParams = {
  [key: string]: any;
  name: string;
  projectId: string;
};

export type ProjectLevelVariableQueryParams = {
  [key: string]: any;
  projectId: string;
};

export default class ProjectLevelVariable extends Ressource {
  id = "";
  name = "";
  value = "";
  is_json = false;
  is_sensitive = false;
  visible_build = false;
  visible_runtime = true;
  created_at = "";
  updated_at = "";

  constructor(projectLevelVariable: APIObject, url: string) {
    super(
      url,
      paramDefaults,
      {},
      projectLevelVariable,
      creatableField,
      modifiableField
    );
  }

  static async get(params: ProjectLevelVariableGetParams, customUrl?: string) {
    const { name, projectId, ...queryParams } = params;
    const { api_url } = getConfig();
    const urlToCall = customUrl ?? `${api_url}${_url}`;

    return super._get<ProjectLevelVariable>(
      `${urlToCall}/:id`,
      { name, projectId },
      paramDefaults,
      queryParams
    );
  }

  static async query(
    params: ProjectLevelVariableQueryParams,
    customUrl?: string
  ) {
    const { projectId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query<ProjectLevelVariable>(
      customUrl ?? `${api_url}${_url}`,
      { projectId },
      paramDefaults,
      queryParams
    );
  }
}
