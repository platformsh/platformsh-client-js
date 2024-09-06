import path from "path";

import parse_url from "parse_url";

import request, { createEventSource } from "../api";
import { getConfig } from "../config";

import Activity from "./Activity";
import Certificate from "./Certificate";
import Domain from "./Domain";
import Environment from "./Environment";
import EnvironmentDomain from "./EnvironmentDomain";
import Integration from "./Integration";
import ProjectAccess from "./ProjectAccess";
import ProjectLevelVariable from "./ProjectLevelVariable";
import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";
import type Subscription from "./Subscription";
import { SubscriptionStatusEnum } from "./Subscription";

const paramDefaults = {};
const modifiableField = [
  "default_domain",
  "title",
  "default_branch",
  "timezone"
];

let _source: EventSource;

export type ProjectGetParams = {
  [key: string]: any;
  id: string;
};

export type Repository = {
  client_ssh_key: string;
  url: string;
};

export default class Project extends Ressource {
  id: string;
  cluster: string;
  cluster_label: string;
  title: string;
  created_at: string;
  updated_at: string;
  name: string;
  owner: string;
  owner_info: {
    type: string;
    username?: string;
    display_name?: string;
  };

  plan: string;
  plan_uri: string;
  hipaa: string;
  enterprise_tag: string;
  subscription: Subscription;
  subscription_id: string;
  environment_id: string;
  status: string;
  endpoint: string;
  repository: Repository;
  region: string;
  region_label: string;
  vendor: string;
  vendor_label: string;
  vendor_resources: string;
  vendor_website: string;
  default_domain: string;
  organization_id: string;
  default_branch: string;
  timezone: string;

  constructor(project: APIObject, url: string) {
    super(url, paramDefaults, {}, project, [], modifiableField);
    this._queryUrl = Ressource.getQueryUrl(url);
    this.id = project.id;
    this.cluster = project.cluster;
    this.cluster_label = project.cluster_label;
    this.title = project.title;
    this.created_at = project.created_at;
    this.updated_at = project.updated_at;
    this.name = project.name;
    this.owner = project.owner;
    this.owner_info = project.owner_info ?? {};
    this.plan = project.plan;
    this.plan_uri = project.plan_uri;
    this.hipaa = project.hipaa;
    this.enterprise_tag = project.enterprise_tag;
    this.subscription = project.subscription;
    this.subscription_id = project.subscription_id;
    this.environment_id = project.environment_id;
    this.status = project.status;
    this.endpoint = project.endpoint;
    this.repository = project.repository;
    this.region = project.region;
    this.region_label = project.region_label;
    this.vendor = project.vendor;
    this.vendor_label = project.vendor_label;
    this.vendor_resources = project.vendor_resources;
    this.vendor_website = project.vendor_website;
    this.default_domain = project.default_domain;
    this.organization_id = project.organization_id;
    this.default_branch = project.default_branch;
    this.timezone = project.timezone;
  }

  static async get(params: ProjectGetParams, customUrl?: string) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Project>(
      customUrl ?? `${api_url}/projects/:id`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  /**
   * Get the subscription ID for the project.
   *
   * @todo when APIs are unified, this can be a property
   *
   * @return int
   */
  getSubscriptionId() {
    if (this.subscription_id) {
      return this.subscription_id;
    }
    if (this.subscription?.license_uri) {
      return path.basename(
        this.subscription.license_uri,
        path.extname(this.subscription.license_uri)
      );
    }
    throw new Error("Subscription ID not found");
  }

  /**
   * Get the Git URL for the project.
   *
   * @return string
   */
  getGitUrl() {
    // The collection doesn't provide a Git URL, but it does provide the
    // right host, so the URL can be calculated.
    if (!this.repository) {
      const parsedUrl = parse_url(this.getUri());

      return `${this.id}@git.${parsedUrl?.[3]}:${this.id}.git`;
    }

    return this.repository.url;
  }

  /**
   * Get the users associated with a project.
   *
   * @return ProjectAccess[]
   */
  async getUsers() {
    return ProjectAccess.query({ projectId: this.id }, this.getLink("#access"));
  }

  /**
   * Add a new user to a project.
   *
   * @param string user   The user's UUID or email address (see byUuid).
   * @param string role   One of ProjectAccess::$roles.
   * @param bool   byUuid Set true if user is a UUID, or false (default) if
   *                       user is an email address.
   *
   * Note that for legacy reasons, the default for byUuid is false for
   * Project::addUser(), but true for Environment::addUser().
   *
   * @return Result
   */
  async addUser(user: string, role: string, byUuid = false) {
    const property = byUuid ? "user" : "email";
    const body = { role, [property]: user };

    const projectAccess = new ProjectAccess(body, this.getLink("access"));

    return projectAccess.save();
  }

  /**
   * Get a single environment of the project.
   *
   * @param string id
   *
   * @return Environment|false
   */
  async getEnvironment(id: string) {
    return Environment.get(
      { projectId: this.id, id },
      this.getLink("environments")
    );
  }

  /**
   * @inheritdoc
   *
   * The accounts API does not (yet) return HAL links. This is a collection
   * of workarounds for that issue.
   */
  getLink(rel: string, absolute = true) {
    if (this.hasLink(rel)) {
      return super.getLink(rel, absolute);
    }
    if (rel === "self" || rel === "#edit") {
      return this.endpoint;
    }
    if (rel === "#manage-variables") {
      return `${this.getUri()}/variables`;
    }
    return `${this.getUri()}/${rel.trim().replace("#", "")}`;
  }

  /**
   * Get a list of environments for the project.
   *
   * @param int limit
   *
   * @return Environment[]
   */
  async getEnvironments(limit?: number) {
    return Environment.query(
      { projectId: this.id, limit },
      this.getLink("environments")
    );
  }

  /**
   * Get a list of domains for the project.
   *
   * @param int limit
   *
   * @return Domain[]
   */
  async getDomains(limit?: number) {
    return Domain.query({ projectId: this.id, limit }, this.getLink("domains"));
  }

  /**
   * Get a list of environment domains for the project.
   *
   * @param int limit
   *
   * @return EnvironmentDomain[]
   */
  async getEnvironmentDomains(environmentId: string) {
    return EnvironmentDomain.query(
      { projectId: this.id, environmentId },
      this.getLink(`environments/${environmentId}/domains`)
    );
  }

  /**
   * Add a environmentDomain to the environment project.
   *
   * @param string name
   * @param string environmentId
   * @param string replacement_for
   * @param array  ssl
   *
   * @return Result
   */
  async addEnvironmentDomain(
    name: string,
    environmentId: string,
    replacement_for?: string,
    ssl?: never[]
  ) {
    const body: Partial<EnvironmentDomain> = { name, replacement_for };

    if (ssl) {
      body.ssl = ssl;
    }

    if (replacement_for) {
      body.replacement_for = replacement_for;
    } else {
      body.is_default = true;
    }

    if (!replacement_for) {
      body.is_default = true;
    }

    const environmentDomain = new EnvironmentDomain(
      body,
      this.getLink(`environments/${environmentId}/domains`)
    );

    return environmentDomain.save();
  }

  /**
   * Get a single domain of the project.
   *
   * @param string name
   *
   * @return Domain|false
   */
  async getDomain(name: string) {
    return Domain.get({ name }, this.getLink("domains"));
  }

  /**
   * Add a domain to the project.
   *
   * @param string name
   * @param array  ssl
   *
   * @return Result
   */
  async addDomain(name: string, ssl = []) {
    const body: Partial<Domain> = { name };

    if (ssl.length) {
      body.ssl = ssl;
    }
    const domain = new Domain(body, this.getLink("domains"));

    return domain.save();
  }

  /**
   * Get a list of integrations for the project.
   *
   * @param int limit
   *
   * @return Integration[]
   */
  async getIntegrations(limit: number) {
    return Integration.query(
      { projectId: this.id, limit },
      this.getLink("integrations")
    );
  }

  /**
   * Get a single integration of the project.
   *
   * @param string id
   *
   * @return Integration|false
   */
  async getIntegration(id: string) {
    return Integration.get(
      { projectId: this.id, id },
      this.getLink("integrations")
    );
  }

  /**
   * Add an integration to the project.
   *
   * @param string type
   * @param array data
   *
   * @return Result
   */
  async addIntegration(type: string, data = []) {
    const body = { type, ...data };
    const integration = new Integration(body, this.getLink("integrations"));

    return integration.save();
  }

  /**
   * Get a single project activity.
   *
   * @param string id
   *
   * @return Activity|false
   */
  async getActivity(id: string) {
    return Activity.get({ id }, `${this.getUri()}/activities`);
  }

  /**
   * Get a list of project activities.
   *
   * @param int limit
   *   Limit the number of activities to return.
   * @param string[] types
   *   Filter activities by type.
   * @param int startsAt
   *   A UNIX timestamp for the maximum created date of activities to return.
   *
   * @return Activity[]
   */
  async getActivities(types: string[], starts_at?: Date) {
    const startsAt = starts_at?.toISOString();
    const params = { type: types, starts_at: startsAt };

    return Activity.query(params, `${this.getUri()}/activities`);
  }

  /**
   * Returns whether the project is suspended.
   *
   * @return bool
   */
  isSuspended() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    return this.status === SubscriptionStatusEnum.STATUS_SUSPENDED;
  }

  /**
   * Get a list of variables.
   *
   * @param int limit
   *
   * @return ProjectLevelVariable[]
   */
  async getVariables(limit: number) {
    return ProjectLevelVariable.query(
      { projectId: this.id, limit },
      this.getLink("#manage-variables")
    );
  }

  /**
   * Set a variable.
   *
   * @param string name
   *   The name of the variable to set.
   * @param mixed  value
   *   The value of the variable to set.
   * @param bool json
   *   True if this value is an encoded JSON value. false if it's a primitive.
   * @param bool sensitive
   *   True if the value is sensitive and needs to be hide, false otherwise
   * @param bool visibleBuild
   *   True if this variable should be exposed during the build phase, false otherwise.
   * @param bool visibleRuntime
   *   True if this variable should be exposed during deploy and runtime, false otherwise.
   *
   * @return Result
   */
  async setVariable(
    name: string,
    value: any,
    is_json = false,
    is_sensitive = false,
    visible_build = true,
    visible_runtime = true
  ) {
    const values = {
      name,
      value,
      is_json,
      is_sensitive,
      visible_build,
      visible_runtime
    };

    return this.getVariable(name)
      .then(async variable => {
        if (variable?.name) {
          return variable.update(values);
        }
      })
      .catch(err => {
        if (err.code === 404) {
          values.name = name;
          const projectLevelVariable = new ProjectLevelVariable(
            values,
            this.getLink("#manage-variables")
          );

          return projectLevelVariable.save();
        }

        return err;
      });
  }

  /**
   * Get a single variable.
   *
   * @param string id
   *   The name of the variable to retrieve.
   * @return ProjectLevelVariable|false
   *   The variable requested, or False if it is not defined.
   */
  async getVariable(name: string) {
    return ProjectLevelVariable.get(
      { projectId: this.id, name },
      this.getLink("#manage-variables")
    );
  }

  /**
   * get certificates
   */
  async getCertificates() {
    return Certificate.query({}, `${this.getUri()}/certificates`);
  }

  /**
   * add certificate
   * @param string certificate
   * @param string key
   * @param array  chain
   */
  async addCertificate(certificate: string, key: string, chain: string[] = []) {
    const certificateObj = new Certificate(
      { certificate, key, chain },
      `${this.getUri()}/certificates`
    );

    return certificateObj.save();
  }

  /**
   * subscribe to project updates
   */
  async subscribe() {
    if (_source) {
      _source.close();
    }
    const { api_url } = getConfig();
    return createEventSource(`${api_url}/projects/${this.id}/subscribe`).then(
      source => {
        _source = source;
        return _source;
      }
    );
  }

  /**
   * Load the theme of the project
   * That contain colors and logo urls
   */
  async loadTheme() {
    return fetch(`${this.vendor_resources}/vendor.json`)
      .then(async response => response.json())
      .then(theme => ({
        logo: `${this.vendor_resources}/images/logo.svg`,
        smallLogo: `${this.vendor_resources}/images/logo-ui.svg`,
        emailLogo: `${this.vendor_resources}/images/logo-email.png`,
        ...theme
      }));
  }

  /**
   * Retrieve list of Capabilities supported
   * by this project
   */
  async getCapabilities() {
    return request(this.getLink("capabilities"));
  }
}
