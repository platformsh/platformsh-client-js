import { request } from "../api";
import { getConfig } from "../config";

import Activity from "./Activity";
import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

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
  "script",
  "syslog",
  "splunk",
  "sumologic",
  "newrelic"
];
const fields = [
  // syslog fields
  "host",
  "port",
  "protocol",
  "facility",
  "message_format",
  "auth_mode",
  "tls_verify",
  "auth_token",

  // splunk
  "index",
  "sourcetype",

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

export type IntegrationGetParams = {
  [key: string]: any;
  projectId: string;
  id: string;
};

export type IntegrationQueryParams = {
  [key: string]: any;
  projectId: string;
};

type BitbucketAppCredentials = {
  key: string;
  secret: string;
};

type BitbucketAddonCredentials = {
  addon_key: string;
  client_key: string;
  shared_secret: string;
};

export default class Integration extends Ressource {
  id = "";
  type = "";

  // These properties may or may not exist on this object, depending on which
  // type of integration it is.
  // We need to add them all so that they can be accessed directly rather than
  // going through the `.data` property that exists on Proxy objects.
  //
  // See https://api.platform.sh/docs/#tag/Third-Party-Integrations/operation/get-projects-integrations
  // for examples of integration data returned for each integration type.

  // BitbucketIntegration
  app_credentials: BitbucketAppCredentials | undefined = undefined;
  addon_credentials: BitbucketAddonCredentials | undefined = undefined;
  repository: string | undefined = undefined;
  fetch_branches: boolean | undefined = undefined;
  prune_branches: boolean | undefined = undefined;
  build_pull_requests: boolean | undefined = undefined;
  resync_pull_requests: boolean | undefined = undefined;

  // BitBucketServerIntegration
  url: string | undefined = undefined;
  username: string | undefined = undefined;
  project: string | undefined = undefined;
  pull_requests_clone_parent_data: boolean | undefined = undefined;

  // BlackfireIntegration
  environments_credentials: Record<string, any> | undefined = undefined;
  supported_runtimes: string[] | undefined = undefined;

  // FastlyIntegration
  events: string[] | undefined = undefined;
  environments: string[] | undefined = undefined;
  excluded_environments: string[] | undefined = undefined;
  states: string[] | undefined = undefined;
  result: string | undefined = undefined;
  service_id: string | undefined = undefined;

  // GithubIntegration
  base_url: string | undefined = undefined;
  build_draft_pull_requests: boolean | undefined = undefined;
  build_pull_requests_post_merge: boolean | undefined = undefined;

  // GitLabIntegration
  // No new properties

  // EmailIntegration
  from_address: string | undefined = undefined;
  recipients: string[] | undefined = undefined;

  // PagerDutyIntegration
  routing_key: string | undefined = undefined;

  // SlackIntegration
  channel: string | undefined = undefined;

  // HealthWebHookIntegration
  // No new properties

  // HipChatIntegration
  room: string | undefined = undefined;

  // NewRelicIntegration
  tls_verify: boolean | undefined = undefined;

  // ScriptIntegration
  script: string | undefined = undefined;

  // SplunkIntegration
  index: string | undefined = undefined;
  sourcetype: string | undefined = undefined;

  // SumologicIntegration
  category: string | undefined = undefined;

  // SyslongIntegration
  host: string | undefined = undefined;
  port: number | undefined = undefined;
  protocol: string | undefined = undefined;
  facility: number | undefined = undefined;
  message_format: string | undefined = undefined;

  // WebHookIntegration
  shared_key: string | undefined = undefined;

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

  static async get(params: IntegrationGetParams, customUrl?: string) {
    const { projectId, id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Integration>(
      customUrl ? `${customUrl}/:id` : `${api_url}${_url}/:id`,
      { projectId, id },
      paramDefaults,
      queryParams
    );
  }

  static async query(params: IntegrationQueryParams, customUrl?: string) {
    const { projectId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query<Integration>(
      customUrl ?? `${api_url}${_url}`,
      { projectId },
      paramDefaults,
      queryParams
    );
  }

  /**
   * @inheritdoc
   */
  checkProperty(property: string, value: string) {
    const errors: Record<string, string> = {};

    if (property === "type" && !types.includes(value)) {
      errors[property] = `Invalid type: '${value}'`;
    }
    return errors;
  }

  /**
   * Get a single integration activity.
   *
   * @param string id
   *
   * @return Activity|false
   */
  async getActivity(id: string) {
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
  async getActivities(type: string, starts_at: number) {
    const params = { type, starts_at };

    return Activity.query(params, `${this.getUri()}/activities`);
  }

  /**
   * Trigger the integration's web hook.
   *
   * Normally the external service should do this in response to events, but
   * it may be useful to trigger the hook manually in certain cases.
   */
  async triggerHook() {
    const hookUrl = this.getLink("#hook");

    return request(hookUrl, "post");
  }
}
