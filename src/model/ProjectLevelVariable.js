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
  constructor(projectLevelVariable, url, params, config) {
    super(
      url,
      paramDefaults,
      {},
      projectLevelVariable,
      creatableField,
      modifiableField,
      config
    );
    this.id = "";
    this.name = "";
    this.value = "";
    this.is_json = "";
    this.is_sensitive = "";
    this.visible_build = "";
    this.visible_runtime = "";
    this.created_at = "";
    this.updated_at = "";
  }

  static get(params = {}, customUrl, config) {
    const { name, projectId, ...queryParams } = params;
    const urlToCall = customUrl || `:api_url${_url}`;

    return super.get(
      `${urlToCall}/:name`,
      { name, projectId },
      super.getConfig(config),
      queryParams
    );
  }

  static query(params, customUrl, config) {
    const { projectId, ...queryParams } = params;

    return super.query(
      customUrl || `:api_url${_url}`,
      { projectId },
      super.getConfig(config),
      queryParams
    );
  }
}
