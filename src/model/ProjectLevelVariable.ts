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
  id: string;
  name: string;
  value: string;
  is_json: boolean;
  is_sensitive: boolean;
  visible_build: boolean;
  visible_runtime: boolean;
  created_at: string;
  updated_at: string;

  constructor(projectLevelVariable: APIObject, url: string) {
    super(
      url,
      paramDefaults,
      {},
      projectLevelVariable,
      creatableField,
      modifiableField
    );

    this.id = projectLevelVariable.id ?? "";
    this.name = projectLevelVariable.name ?? "";
    this.value = projectLevelVariable.value ?? "";
    this.is_json = projectLevelVariable.is_json ?? false;
    this.is_sensitive = projectLevelVariable.is_sensitive ?? false;
    this.visible_build = projectLevelVariable.visible_build ?? false;
    this.visible_runtime = projectLevelVariable.visible_runtime ?? true;
    this.created_at = projectLevelVariable.created_at ?? "";
    this.updated_at = projectLevelVariable.updated_at ?? "";
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
