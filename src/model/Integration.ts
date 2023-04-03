import Ressource, { APIObject } from "./Ressource";
import Activity from "./Activity";
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
  "health.webhook",
  "script"
];
const fields = [
  "addon_credentials",
  "app_credentials",
  "base_url",
  "category",
  "channel",
  "from_address",
  "license_key",
  "project",
  "recipients",
  "repository",
  "resync_pull_requests",
  "room",
  "routing_key",
  "shared_key",
  "script",
  "token",
  "url",
  "username",

  "events",
  "environments",
  "excluded_environments",
  "states",

  "build_draft_pull_requests",
  "build_merge_requests",
  "build_pull_requests",
  "build_pull_requests_post_merge",
  "build_wip_merge_requests",
  "fetch_branches",
  "merge_requests_clone_parent_data",
  "prune_branches",
  "pull_requests_clone_parent_data"
];
const _url = "/projects/:projectId/integrations";

export interface IntegrationGetParams {
  projectId: string;
  id: string;
  [key: string]: any;
}

export interface IntegrationQueryParams {
  projectId: string;
  [key: string]: any;
}

export default class Integration extends Ressource {
  id = "";
  type = "";
  category = "";

  constructor(integration: APIObject, url: string) {
    super(
      url,
      paramDefaults,
      integration,
      integration,
      fields.concat("type"),
      fields
    );
    this._required = ["type"];
  }

  /**
   * @inheritdoc
   */
  checkProperty(property: string, value: string) {
    const errors: Record<string, string> = {};

    if (property === "type" && types.indexOf(value) === -1) {
      errors[property] = `Invalid type: '${value}'`;
    }
    return errors;
  }

  static get(params: IntegrationGetParams, customUrl?: string) {
    const { projectId, id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Integration>(
      customUrl ? `${customUrl}/:id` : `${api_url}${_url}/:id`,
      { projectId, id },
      paramDefaults,
      queryParams
    );
  }

  static query(params: IntegrationQueryParams, customUrl?: string) {
    const { projectId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query<Integration>(
      customUrl || `${api_url}${_url}`,
      { projectId },
      paramDefaults,
      queryParams
    );
  }

  /**
   * Get a single integration activity.
   *
   * @param string id
   *
   * @return Activity|false
   */
  getActivity(id: string) {
    return Activity.get({ id }, `${this.getUri()}/activities`);
  }

  /**
   * Get a list of integration activities.
   *
   * @param int    limit
   *   Limit the number of activities to return.
   * @param string type
   *   Filter activities by type.
   * @param int    startsAt
   *   A UNIX timestamp for the maximum created date of activities to return.
   *
   * @return Activity[]
   */
  getActivities(type: string, starts_at: number) {
    const params = { type, starts_at };

    return Activity.query(params, `${this.getUri()}/activities`);
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
