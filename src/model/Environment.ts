import slugify from "slugify";

import { getConfig } from "../config";

import Activity from "./Activity";
import EnvironmentAccess from "./EnvironmentAccess";
import Commit from "./git/Commit";
import Metrics from "./Metrics";
import type { APIObject, ParamsType } from "./Ressource";
import Ressource from "./Ressource";
import Route from "./Route";
import Variable from "./Variable";

const paramDefaults = {
  projectId: "project"
};
const modifiableField = [
  "parent",
  "enable_smtp",
  "restrict_robots",
  "http_access",
  "title",
  "type"
];
const _url = "/projects/:projectId/environments";

const sshRegex = /^ssh:\/\/([a-zA-Z0-9_-]+)@(.+)$/u;
const sshLinkKeyPrefix = "pf:ssh:";

export type EnvironmentGetParams = {
  [key: string]: any;
  projectId: string;
  id: string;
};

export type EnvironmentQueryParams = {
  [key: string]: any;
  projectId: string;
};

export enum Status {
  active = "active",
  dirty = "dirty",
  inactive = "inactive",
  deleting = "deleting",
  paused = "paused"
}

type DeploymentState = {
  crons: {
    enabled: boolean;
    status: "running" | "paused";
  };
  last_deployment_at: string | null;
  last_deployment_successful: boolean;
};

type HttpAccess = {
  is_enabled?: boolean;
  addresses?: {
    permission: "allow" | "deny";
    address: string;
  }[];
  basic_auth?: Record<string, string | undefined | null>;
};

export default class Environment extends Ressource {
  id: string;
  status: Status;
  head_commit: string;
  name: string;
  parent: string | null;
  machine_name: string;
  restrict_robots: boolean;
  title: string;
  created_at: string;
  updated_at: string;
  last_active_at: string;
  last_backup_at: string;
  project: string;
  is_dirty: boolean;
  enable_smtp: boolean;
  has_code: boolean;
  deployment_target: string;
  deployment_state?: DeploymentState;
  http_access: HttpAccess;
  is_main: boolean;
  type: string;
  edge_hostname: string;
  has_deployment: boolean;

  constructor(environment: APIObject, url: string) {
    super(url, paramDefaults, environment, environment, [], modifiableField);

    this.id = environment.id ?? "";
    this.status = environment.status ?? Status.inactive;
    this.head_commit = environment.head_commit ?? "";
    this.name = environment.name ?? "";
    this.parent = environment.parent ?? null;
    this.machine_name = environment.machine_name ?? "";
    this.restrict_robots = environment.restrict_robots ?? false;
    this.title = environment.title ?? "";
    this.created_at = environment.created_at ?? "";
    this.updated_at = environment.updated_at ?? "";
    this.last_active_at = environment.last_active_at ?? "";
    this.last_backup_at = environment.last_backup_at ?? "";
    this.project = environment.project ?? "";
    this.is_dirty = environment.is_dirty ?? false;
    this.enable_smtp = environment.enable_smtp ?? false;
    this.has_code = environment.has_code ?? false;
    this.deployment_target = environment.deployment_target ?? "";
    this.deployment_state = environment.deployment_state ?? undefined;
    this.http_access = environment.http_access ?? {};
    this.is_main = environment.is_main ?? false;
    this.type = environment.type ?? "";
    this.edge_hostname = environment.edge_hostname ?? "";
    this.has_deployment = environment.has_deployment ?? false;
  }

  static async get(params: EnvironmentGetParams, customUrl?: string) {
    const { projectId, id, ...queryParams } = params;
    const { api_url } = getConfig();
    const urlToCall = customUrl ? `${customUrl}/:id` : `${api_url}${_url}/:id`;

    return super._get<Environment>(
      urlToCall,
      { project: projectId, id },
      paramDefaults,
      queryParams
    );
  }

  static async query(params: EnvironmentQueryParams, customUrl?: string) {
    const { projectId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query<Environment>(
      customUrl ?? `${api_url}${_url}`,
      { project: projectId },
      paramDefaults,
      queryParams
    );
  }

  async update(data: Partial<Environment>) {
    return super.update(data);
  }

  /**
   * Get the SSH URL for the environment.
   *
   * @param string app An application name.
   *
   * @throws EnvironmentStateException
   *
   * @return string
   */
  getSshUrl(app = "") {
    const urls = this.getSshUrls();

    if (this.hasLink("ssh") && app === "") {
      return this.convertSshUrl(this.getLink("ssh"));
    }

    if (urls[app]) {
      return this.convertSshUrl(urls[app]);
    }

    return this.constructLegacySshUrl(app);
  }

  constructLegacySshUrl(app = "") {
    const suffix = app ? `--${app}` : "";

    return this.convertSshUrl(this.getLink("ssh"), suffix);
  }

  convertSshUrl(url: string, username_suffix = "") {
    const sshUrl = sshRegex.exec(url);
    if (sshUrl) {
      const [, user, host] = sshUrl;

      return `${user}${username_suffix}@${host}`;
    }
  }

  getSshUrls() {
    const links = this.getLinks();
    if (!links) {
      return {};
    }

    const sshUrls = Object.keys(links)
      .filter(linkKey => linkKey.startsWith(sshLinkKeyPrefix))
      .reduce<Record<string, string>>((urls, linkKey) => {
        urls[linkKey.substr(sshLinkKeyPrefix.length)] = links[linkKey].href;
        return urls;
      }, {});

    if (this.hasLink("ssh") && Object.keys(sshUrls).length === 0) {
      sshUrls.ssh = `ssh://${this.constructLegacySshUrl()}`;
    }

    return sshUrls;
  }

  /**
   * Branch (create a new environment).
   *
   * @param string title The title of the new environment.
   * @param string type The type of the new environment
   * @param string id    The ID of the new environment. This will be the Git
   *                      branch name. Leave blank to generate automatically
   *                      from the title.
   *
   * @return Activity
   */
  async branch(
    title: string,
    type: string,
    resourcesInit?: string,
    id = this.sanitizeId(title)
  ) {
    const body: Record<string, string | Record<string, string>> = {
      name: id,
      title,
      type
    };

    if (resourcesInit) {
      body.resources = { init: resourcesInit };
    }

    return this.runLongOperation("branch", "POST", body);
  }

  /**
   * @param string proposed
   *
   * @return string
   */
  sanitizeId(proposed: string) {
    return slugify(proposed).substr(0, 32);
  }

  /**
   * Delete the environment.
   *
   * @throws EnvironmentStateException
   *
   * @return Result
   */
  async delete() {
    if (this.isActive()) {
      throw new Error("Active environments cannot be deleted");
    }
    return super.delete();
  }

  /**
   * @return bool
   */
  isActive() {
    return this.status === Status.active;
  }

  /**
   * Activate the environment.
   *
   * @throws EnvironmentStateException
   *
   * @return Activity
   */
  async activate() {
    if (this.isActive()) {
      throw new Error("Active environments cannot be activated");
    }
    return this.runLongOperation("activate", "POST");
  }

  /**
   * Deactivate the environment.
   *
   * @throws EnvironmentStateException
   *
   * @return Activity
   */
  async deactivate() {
    if (!this.isActive() && this.status !== Status.paused) {
      throw new Error("Inactive environments cannot be deactivated");
    }
    return this.runLongOperation("deactivate", "POST");
  }

  /**
   * Merge an environment into its parent.
   *
   * @throws OperationUnavailableException
   *
   * @return Activity
   */
  async merge(body?: ParamsType) {
    if (!this.parent) {
      throw new Error(
        "The environment does not have a parent, so it cannot be merged"
      );
    }

    return this.runLongOperation("merge", "POST", body);
  }

  /**
   * Synchronize an environment with its parent.
   *
   * @param bool code
   * @param bool data
   *
   * @throws \InvalidArgumentException
   *
   * @return Activity
   */
  async synchronize(data: boolean, code: boolean, resources?: boolean) {
    if (!data && !code && !resources) {
      throw new Error(
        "Nothing to synchronize: you must specify data, code or resources"
      );
    }
    const body: {
      synchronize_data: boolean;
      synchronize_code: boolean;
      synchronize_resources?: boolean;
    } = {
      synchronize_data: data,
      synchronize_code: code
    };

    if (typeof resources !== "undefined") {
      body.synchronize_resources = resources;
    }

    return this.runLongOperation("synchronize", "post", body);
  }

  /**
   * Create a backup of the environment.
   *
   * @return Activity
   */
  async backup(safe = true) {
    return this.runLongOperation("backup", "POST", { safe });
  }

  /**
   * Redeploy the current environment
   *
   * @return Activity
   */
  async redeploy() {
    return this.runLongOperation("redeploy");
  }

  /**
   * Resume the current environment
   *
   * @return Activity
   */
  async resume() {
    return this.runLongOperation("resume");
  }

  /**
   * Pause the current environment
   *
   * @return Activity
   */
  async pause() {
    return this.runLongOperation("pause");
  }

  /**
   * Get a single environment activity.
   *
   * @param string id
   *
   * @return Activity|false
   */
  async getActivity(id: string) {
    return Activity.get({ id }, `${this.getUri()}/activities`);
  }

  /**
   * Get a list of environment activities.
   *
   * @param string type
   *   Filter activities by type.
   * @param int    startsAt
   *   A UNIX timestamp for the maximum created date of activities to return.
   *
   * @return Activity[]
   */
  async getActivities(type: string, starts_at?: number) {
    const params = { type, starts_at };
    return Activity.query(params, `${this.getUri()}/activities`);
  }

  /**
   * Get a list of variables.
   *
   * @param int limit
   *
   * @return Variable[]
   */
  async getVariables(limit: number) {
    return Variable.query(
      { projectId: this.project, environmentId: this.id, limit },
      this.getLink("#manage-variables")
    );
  }

  /**
   * Set a variable
   *
   * @param string name
   * @param mixed  value
   * @param bool   json
   * @param bool   enabled
   * @param bool   inheritable
   * @param bool   sensitive
   * @param bool   visibleBuild
   * @param bool   visibleRuntime
   *
   * @return Result
   */

  async setVariable(
    name: string,
    value: string,
    is_json = false,
    is_enabled = true,
    is_inheritable = true,
    is_sensitive = false,
    visible_build = true,
    visible_runtime = true
  ) {
    const values = {
      name,
      value,
      is_json,
      is_enabled,
      is_inheritable,
      is_sensitive,
      visible_build,
      visible_runtime
    };

    return this.getVariable(name)
      .then(async (existing: Variable) => {
        if (existing?.id) {
          return existing.update(values);
        }
      })
      .catch(err => {
        if (err.code === 404) {
          values.name = name;
          const variable = new Variable(
            values,
            this.getLink("#manage-variables")
          );

          return variable.save();
        }
        return err;
      });
  }

  /**
   * Get a single variable.
   *
   * @param string id
   *
   * @return Variable|false
   */
  async getVariable(id: string) {
    return Variable.get(
      { projectId: this.project, environmentId: this.id, id },
      this.getLink("#manage-variables")
    );
  }

  /**
   * Set the environment's route configuration.
   *
   * @param object route
   *
   * @return Route
   */
  async setRoute(values: Route) {
    if (!values.id) {
      const route = new Route(values, this.getLink("#manage-routes"));

      return route.save();
    }
    return this.getRoute(values.id).then(async existing => {
      if (existing?.id) {
        return existing.update(
          values,
          `${this.getLink("#manage-routes")}/${encodeURIComponent(existing.id)}`
        );
      }

      const route = new Route(values, this.getLink("#manage-routes"));

      return route.save();
    });
  }

  /**
   * Get the route configuration.
   *
   *
   * @return Route
   */
  async getRoute(id: string) {
    return Route.get(
      { projectId: this.project, environmentId: this.id, id },
      this.getLink("#manage-routes")
    );
  }

  /**
   * Get the environment's routes configuration.
   *
   *
   * @return Route[]
   */
  async getRoutes() {
    return Route.query(
      { projectId: this.project, environmentId: this.id },
      this.getLink("#manage-routes")
    );
  }

  /**
   * Get the resolved URLs for the environment's routes.
   *
   * @return string[]
   */
  getRouteUrls() {
    const links = this.getLinks();
    if (!links) return [];

    const routes = links["pf:routes"];
    if (!routes || !Array.isArray(routes)) {
      return [];
    }
    return routes.map(route => route.href);
  }

  /**
   * Initialize the environment from an external repository.
   *
   * This can only work when the repository is empty.
   *
   * @param string profile
   *   The name of the profile. This is shown in the resulting activity log.
   * @param string repository
   *   A repository URL, optionally followed by an '@' sign and a branch name,
   *   e.g. 'git://github.com/platformsh/platformsh-examples.git@drupal/7.x'.
   *   The default branch is 'master'.
   *
   * @return Activity
   */
  async initialize(profile: string, repository: string) {
    return this.runLongOperation("initialize", "post", { profile, repository });
  }

  /**
   * Get a user's access to this environment.
   *
   * @param string uuid
   *
   * @return EnvironmentAccess|false
   */
  async getUser(id: string) {
    return EnvironmentAccess.get(
      { projectId: this.project, environmentId: this.id, id },
      this.getLink("#manage-access")
    );
  }

  /**
   * Get the users with access to this environment.
   *
   * @return EnvironmentAccess[]
   */
  async getUsers() {
    return EnvironmentAccess.query(
      { projectId: this.project, environmentId: this.id },
      this.getLink("#manage-access")
    );
  }

  /**
   * Add a new user to the environment.
   *
   * @param string user   The user's UUID or email address (see byUuid).
   * @param string role   One of EnvironmentAccess::roles.
   * @param bool   byUuid Set true (default) if user is a UUID, or false if
   *                       user is an email address.
   *
   * Note that for legacy reasons, the default for byUuid is false for
   * Project::addUser(), but true for Environment::addUser().
   *
   * @return Result
   */
  async addUser(user: string, role: string, byUuid = true) {
    const property = byUuid ? "user" : "email";
    const body: {
      id: string;
      role: string;
      user?: string;
      email?: string;
    } = { id: "", role, [property]: user };

    const environmentAccess = new EnvironmentAccess(
      body,
      this.getLink("#manage-access")
    );

    return environmentAccess.save();
  }

  /**
   * Remove a user's access to this environment.
   *
   * @param string uuid
   *
   * @return EnvironmentAccess|false
   */
  async removeUser(id: string) {
    return EnvironmentAccess.get(
      { projectId: this.project, environmentId: this.id, id },
      this.getLink("#manage-access")
    ).then(async environmentAccess => environmentAccess?.delete());
  }

  /**
   * Get environment metrics.
   *
   * @param string query
   *   InfluxDB query
   *
   * @return Metrics
   */
  async getMetrics(query: string) {
    const params = query ? { q: query } : {};

    return Metrics.get(params, `${this.getUri()}/metrics`);
  }

  /**
   * Get head commit.
   *
   * @param string project id
   * @param string head commit sha
   *
   * @return Commit
   */
  async getHeadCommit() {
    return Commit.get(this.project, this.head_commit);
  }
}
