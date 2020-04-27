import Ressource from "./Ressource";
import { request } from "../api";
import { getConfig } from "../config";

const paramDefaults = {};
const types = [
  "bitbucket",
  "bitbucket_server",
  "github",
  "gitlab",
  "hipchat",
  "webhook",
  "health.email",
  "health.pagerduty",
  "health.slack",
  "script"
];
const _url = "/projects/:projectId/integrations";

export default class Integration extends Ressource {
  constructor(integration, url) {
    const { id } = integration;

    super(url, paramDefaults, { id }, integration, ["type"]);
    this._required = ["type"];
    this.id = "";
    this.type = "";
  }

  /**
   * @inheritdoc
   */
  checkProperty(property, value) {
    const errors = {};

    if (property === "type" && types.indexOf(value) === -1) {
      errors[property] = `Invalid type: '${value}'`;
    }
    return errors;
  }

  static get(params, customUrl) {
    const { projectId, id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super.get(
      customUrl ? `${customUrl}/:id` : `${api_url}${_url}/:id`,
      { projectId, id },
      paramDefaults,
      queryParams
    );
  }

  static query(params, customUrl) {
    const { projectId, ...queryParams } = params;
    const { api_url } = getConfig();
    debugger;

    return super.query(
      customUrl || `${api_url}${_url}`,
      { projectId },
      paramDefaults,
      queryParams
    );
  }

  /**
   * Trigger the integration's web hook.
   *
   * Normally the external service should do this in response to events, but
   * it may be useful to trigger the hook manually in certain cases.
   */
  triggerHook() {
    const hookUrl = this.getLink("#hook");

    return request(hookUrl, "post");
  }
}
