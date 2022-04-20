import { APIObject } from "../Ressource";
import { getConfig } from "../../config";
import { autoImplementWithResources } from "../utils";

import { ProjectLevelVariableGetParams, ProjectLevelVariableQueryParams, ProjectVariableType} from "./types";

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

export default class ProjectLevelVariable extends autoImplementWithResources()<ProjectVariableType>() {
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

  static get(params: ProjectLevelVariableGetParams, customUrl?: string) {
    const { name, projectId, ...queryParams } = params;
    const { api_url } = getConfig();
    const urlToCall = customUrl || `${api_url}${_url}`;

    return super._get<ProjectLevelVariable>(
      `${urlToCall}/:id`,
      { name, projectId },
      paramDefaults,
      queryParams
    );
  }

  static query(params:ProjectLevelVariableQueryParams, customUrl?: string) {
    const { projectId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query<ProjectLevelVariable>(
      customUrl || `${api_url}${_url}`,
      { projectId },
      paramDefaults,
      queryParams
    );
  }
}
