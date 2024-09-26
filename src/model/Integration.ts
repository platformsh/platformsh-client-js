import { request } from "../api";
import { getConfig } from "../config";

import { Activity } from "./Activity";
import type { APIObject } from "./Ressource";
import { Ressource } from "./Ressource";

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
  "newrelic",
  "httplog"
];
const fields = [
  //httplog
  "headers",
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

export class Integration extends Ressource {
  id: string;
  type: string;

  // These properties may or may not exist on this object, depending on which
  // type of integration it is.
  // We need to add them all so that they can be accessed directly rather than
  // going through the `.data` property that exists on Proxy objects.
  //
  // See https://api.platform.sh/docs/#tag/Third-Party-Integrations/operation/get-projects-integrations
  // for examples of integration data returned for each integration type.

  // BitbucketIntegration
  app_credentials: BitbucketAppCredentials | undefined;
  addon_credentials: BitbucketAddonCredentials | undefined;
  repository: string | undefined;
  fetch_branches: boolean | undefined;
  prune_branches: boolean | undefined;
  build_pull_requests: boolean | undefined;
  resync_pull_requests: boolean | undefined;

  // BitBucketServerIntegration
  url: string | undefined;
  username: string | undefined;
  project: string | undefined;
  pull_requests_clone_parent_data: boolean | undefined;

  // BlackfireIntegration
  environments_credentials: Record<string, any> | undefined;
  supported_runtimes: string[] | undefined;

  // FastlyIntegration
  events: string[] | undefined;
  environments: string[] | undefined;
  excluded_environments: string[] | undefined;
  states: string[] | undefined;
  result: string | undefined;
  service_id: string | undefined;

  // GithubIntegration
  base_url: string | undefined;
  build_draft_pull_requests: boolean | undefined;
  build_pull_requests_post_merge: boolean | undefined;

  // GitLabIntegration
  build_wip_merge_requests: boolean | undefined;
  build_merge_requests: boolean | undefined;
  merge_requests_clone_parent_data: boolean | undefined;

  // EmailIntegration
  from_address: string | undefined;
  recipients: string[] | undefined;

  // PagerDutyIntegration
  routing_key: string | undefined;

  // SlackIntegration
  channel: string | undefined;

  // HealthWebHookIntegration
  // No new properties

  // HipChatIntegration
  room: string | undefined;

  // NewRelicIntegration
  tls_verify: boolean | undefined;

  // ScriptIntegration
  script: string | undefined;

  // SplunkIntegration
  index: string | undefined;
  sourcetype: string | undefined;

  // SumologicIntegration
  category: string | undefined;

  // SyslongIntegration
  host: string | undefined;
  port: number | undefined;
  protocol: string | undefined;
  facility: number | undefined;
  message_format: string | undefined;
  headers: Record<string, string>;
  // WebHookIntegration
  shared_key: string | undefined;
  token: string | undefined;

  constructor(integration: APIObject, url: string) {
    super(
      url,
      paramDefaults,
      integration,
      integration,
      fields.concat("type"),
      fields
    );

    this.id = integration.id;
    this.type = integration.type;
    this.app_credentials = integration.app_credentials;
    this.addon_credentials = integration.addon_credentials;
    this.repository = integration.repository;
    this.fetch_branches = integration.fetch_branches;
    this.prune_branches = integration.prune_branches;
    this.build_pull_requests = integration.build_pull_requests;
    this.resync_pull_requests = integration.resync_pull_requests;
    this.url = integration.url;
    this.username = integration.username;
    this.project = integration.project;
    this.pull_requests_clone_parent_data =
      integration.pull_requests_clone_parent_data;
    this.environments_credentials = integration.environments_credentials;
    this.supported_runtimes = integration.supported_runtimes;
    this.events = integration.events;
    this.environments = integration.environments;
    this.excluded_environments = integration.excluded_environments;
    this.states = integration.states;
    this.result = integration.result;
    this.service_id = integration.service_id;
    this.base_url = integration.base_url;
    this.build_draft_pull_requests = integration.build_draft_pull_requests;
    this.build_pull_requests_post_merge =
      integration.build_pull_requests_post_merge;
    this.build_wip_merge_requests = integration.build_wip_merge_requests;
    this.build_merge_requests = integration.build_merge_requests;
    this.merge_requests_clone_parent_data =
      integration.merge_requests_clone_parent_data;
    this.from_address = integration.from_address;
    this.recipients = integration.recipients;
    this.routing_key = integration.routing_key;
    this.channel = integration.channel;
    this.room = integration.room;
    this.tls_verify = integration.tls_verify;
    this.script = integration.script;
    this.index = integration.index;
    this.sourcetype = integration.sourcetype;
    this.category = integration.category;
    this.host = integration.host;
    this.port = integration.port;
    this.protocol = integration.protocol;
    this.facility = integration.facility;
    this.message_format = integration.message_format;
    this.headers = integration.headers;
    this.shared_key = integration.shared_key;
    this.token = integration.token;
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
  async getActivities(type?: string, starts_at?: number) {
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
