import "isomorphic-fetch"; // fetch api polyfill
import parse_url from "parse_url";
import path from "path";

import { createEventSource } from "../api";
import { getConfig } from "../config";

import Ressource, { APIObject } from "./Ressource";
import ProjectAccess from "./ProjectAccess";
import Environment from "./Environment";
import Domain from "./Domain";
import Integration from "./Integration";
import ProjectLevelVariable from "./ProjectLevelVariable";
import Activity from "./Activity";
import Certificate from "./Certificate";
import request from "../api";
import Subscription, { SubscriptionStatusEnum } from "./Subscription";
import Variable from "./Variable";

const paramDefaults = {};
const modifiableField = [
  "default_domain",
  "title",
  "default_branch",
  "timezone"
];
const url = "/projects/:id";
let _source: EventSource;

export interface ProjectGetParams {
  id: string;
  [key: string]: any;
}

export interface Repository {
  client_ssh_key: string;
  url: string;
}

export default class Project extends Ressource {
  id = "";
  cluster = "";
  cluster_label = "";
  title = "";
  created_at = "";
  updated_at = "";
  name = "";
  owner = "";
  owner_info = {};
  plan = "";
  plan_uri = "";
  subscription: Subscription = new Subscription({});
  subscription_id = "";
  status = "";
  endpoint = "";
  repository: Repository = {
    url: "",
    client_ssh_key: ""
  };
  region = "";
  region_label = "";
  vendor = "";
  vendor_label = "";
  vendor_resources = "";
  vendor_website = "";
  default_domain = "";
  organization_id = "";
  default_branch = "";

  constructor(project: APIObject, url: string) {
    super(url, paramDefaults, {}, project, [], modifiableField);
    this._queryUrl = Ressource.getQueryUrl(url);
  }

  static get(params: ProjectGetParams, customUrl?: string) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Project>(
      customUrl || `${api_url}${url}`,
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
    if (this.subscription && this.subscription.license_uri) {
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

      return `${this.id}@git.${parsedUrl[3]}:${this.id}.git`;
    }

    return this.repository.url;
  }

  /**
   * Get the users associated with a project.
   *
   * @return ProjectAccess[]
   */
  getUsers() {
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
  addUser(user: string, role: string, byUuid = false) {
    const property = byUuid ? "user" : "email";
    let body = { role, [property]: user };

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
  getEnvironment(id: string) {
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
  getEnvironments(limit: number) {
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
  getDomains(limit?: number) {
    return Domain.query({ projectId: this.id, limit }, this.getLink("domains"));
  }

  /**
   * Get a single domain of the project.
   *
   * @param string name
   *
   * @return Domain|false
   */
  getDomain(name: string) {
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
  addDomain(name: string, ssl = []) {
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
  getIntegrations(limit: number) {
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
  getIntegration(id: string) {
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
  addIntegration(type: string, data = []) {
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
  getActivity(id: string) {
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
  getActivities(types: Array<string>, starts_at: number) {
    const params = { type: types, starts_at };

    return Activity.query(params, `${this.getUri()}/activities`);
  }

  /**
   * Returns whether the project is suspended.
   *
   * @return bool
   */
  isSuspended() {
    console.log("TEST");
    console.log(this.status);
    return this.status === SubscriptionStatusEnum.STATUS_SUSPENDED;
  }

  /**
   * Get a list of variables.
   *
   * @param int limit
   *
   * @return ProjectLevelVariable[]
   */
  getVariables(limit: number) {
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
  setVariable(
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
      .then(variable => {
        if (variable && variable.name) {
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
  getVariable(name: string) {
    return ProjectLevelVariable.get(
      { projectId: this.id, name },
      this.getLink("#manage-variables")
    );
  }

  /**
   * get certificates
   */
  getCertificates() {
    return Certificate.query({}, `${this.getUri()}/certificates`);
  }

  /**
   * add certificate
   * @param string certificate
   * @param string key
   * @param array  chain
   */
  addCertificate(certificate: string, key: string, chain = []) {
    const certificateObj = new Certificate(
      { certificate, key, chain },
      `${this.getUri()}/certificates`
    );

    return certificateObj.save();
  }

  /**
   * subscribe to project updates
   */
  subscribe() {
    if (_source) {
      _source.close();
    }
    return createEventSource(`${this.getUri()}/subscribe`).then(source => {
      _source = source;
      return _source;
    });
  }

  /**
   * Load the theme of the project
   * That contain colors and logo urls
   */
  loadTheme() {
    return fetch(`${this.vendor_resources}/vendor.json`)
      .then(response => response.json())
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
  getCapabilities() {
    return request(this.getLink("capabilities"));
  }
}
