import Ressource from "./Ressource";
import { getConfig } from "../config";

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

export default class ProjectLevelVariable extends Ressource {
  constructor(projectLevelVariable, url) {
    super(
      url,
      paramDefaults,
      {},
      projectLevelVariable,
      creatableField,
      modifiableField
    );
    this.id = "";
    this.name = "";
    this.value = "";
    this.is_json = false;
    this.is_sensitive = false;
    this.visible_build = false;
    this.visible_runtime = true;
    this.created_at = "";
    this.updated_at = "";
  }

  static get(params = {}, customUrl) {
    const { name, projectId, ...queryParams } = params;
    const { api_url } = getConfig();
    const urlToCall = customUrl || `${api_url}${_url}`;

    return super._get(
      `${urlToCall}/:id`,
      { name, projectId },
      paramDefaults,
      queryParams
    );
  }

  static query(params, customUrl) {
    const { projectId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query(
      customUrl || `${api_url}${_url}`,
      { projectId },
      paramDefaults,
      queryParams
    );
  }
}
