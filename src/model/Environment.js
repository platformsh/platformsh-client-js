import parse_url from 'parse_url';
import slugify from 'slugify';
import is_scalar from 'is-scalar';

import Ressource from './Ressource';
import Activity from './Activity';
import Variable from './Variable';
import Route from './Route';
import EnvironmentAccess from './EnvironmentAccess';
import Metric from './Metric';

const paramDefaults = {};
const modifiableField = ['enable_smtp', 'restrict_robots', 'http_access', 'title'];

export default class Environment extends Ressource {
  constructor(environment, url) {
    const { id } = environment;

    super(url, paramDefaults, { id }, environment, [], modifiableField);
    this.id = '';
    this.status = '';
    this.head_commit = '';
    this.name = '';
    this.parent = '';
    this.machine_name = '';
    this.restrict_robots = false;
    this.title = '';
    this.created_at = '';
    this.updated_at = '';
    this.project = '';
    this.is_dirty = false;
    this.enable_smtp = false;
    this.has_code = false;
    this.deployment_target = '';
    this.http_access = {};
    this.is_main = [];
  }

  static get(params, url) {
    const { id, ...queryParams } = params;

    return super.get(`${url}/:id`, { id }, paramDefaults, queryParams);
  }

  static query(params, url) {
    return super.query(url, {}, paramDefaults, params);
  }

  update(data) {
    return super.update(data, `${this._url}/:id`);
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
  getSshUrl(app = '') {
    if (!this.hasLink('ssh')) {
      throw new Error(`The environment '${this.id}' does not have an SSH URL. It may be currently inactive, or you may not have permission to SSH.`); // eslint-disable-line max-len
    }
    const sshUrl = parse_url(this.getLink('ssh'));
    const host = sshUrl[3];
    let user = sshUrl[(sshUrl.indexOf('user') + 1)];

    if (app) {
      user += `--${app}`;
    }
    return `${user}@${host}}`;
  }

  /**
  * Branch (create a new environment).
  *
  * @param string title The title of the new environment.
  * @param string id    The ID of the new environment. This will be the Git
  *                      branch name. Leave blank to generate automatically
  *                      from the title.
  *
  * @return Activity
  */
  branch(title, id = this.sanitizeId(title)) {
    const body = { name: id, title };

    return this.runLongOperation('branch', 'POST', body);
  }

  /**
  * @param string proposed
  *
  * @return string
  */
  sanitizeId(proposed) {
    return slugify(proposed).substr(0, 32);
  }

  /**
  * Delete the environment.
  *
  * @throws EnvironmentStateException
  *
  * @return Result
  */
  delete() {
    if (this.isActive()) {
      throw new Error('Active environments cannot be deleted');
    }
    return super.delete();
  }

  /**
  * @return bool
  */
  isActive() {
    return this.status === 'active';
  }

  /**
  * Activate the environment.
  *
  * @throws EnvironmentStateException
  *
  * @return Activity
  */
  activate() {
    if (this.isActive()) {
      throw new Error('Active environments cannot be activated');
    }
    return this.runLongOperation('activate', '', {});
  }

  /**
  * Deactivate the environment.
  *
  * @throws EnvironmentStateException
  *
  * @return Activity
  */
  deactivate() {
    if (!this.isActive()) {
      throw new Error('Inactive environments cannot be deactivated');
    }
    return this.runLongOperation('deactivate', 'POST', {});
  }

  /**
  * Merge an environment into its parent.
  *
  * @throws OperationUnavailableException
  *
  * @return Activity
  */
  merge() {
    if (!this.parent) {
      throw new Error('The environment does not have a parent, so it cannot be merged');
    }
    return this.runLongOperation('merge', 'POST', {});
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
  synchronize(data, code) {
    if (!data && !code) {
      throw new Error('Nothing to synchronize: you must specify data or code');
    }
    const body = {'synchronize_data': data, 'synchronize_code': code};

    return this.runLongOperation('synchronize', 'post', body);
  }

  /**
   * Create a backup of the environment.
   *
   * @return Activity
   */
  backup() {
    return this.runLongOperation('backup');
  }
  /**
   * Get a single environment activity.
   *
   * @param string id
   *
   * @return Activity|false
   */
  getActivity(id) {
    return Activity.get({ id }, `${this.getUri()}/activities`);
  }

  /**
  * Get a list of environment activities.
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
  getActivities(type, starts_at) {
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
  getVariables(limit) {
    return Variable.query({ limit }, this.getLink('#manage-variables'));
  }

  /**
  * Set a variable
  *
  * @param string name
  * @param mixed  value
  * @param bool   json
  *
  * @return Result
  */
  setVariable(name, value, json = false) {
    let encodedValue = {...value};

    if (!is_scalar(encodedValue)) {
      encodedValue = JSON.parse(encodedValue);
      json = true;
    }
    const values = { value: encodedValue, 'is_json': json };

    return this.getVariable(name).then(existing => {
      if (existing) {
        return existing.update(values);
      }
      values.name = name;
      const variable = new Variable(values, this.getLink('#manage-variables'));

      return variable.save();
    });
  }

/**
   * Get a single variable.
   *
   * @param string id
   *
   * @return Variable|false
   */
  getVariable(id) {
    return Variable.get({ id }, this.getLink('#manage-variables'));
  }

  /**
   * Get the environment's routes configuration.
   *
   *
   * @return Route[]
   */
  getRoutes() {
    return Route.query(this.getLink('#manage-routes'));
  }

  /**
   * Get the resolved URLs for the environment's routes.
   *
   * @return string[]
   */
  getRouteUrls() {
    const routes = this.data._links['pf:routes'];

    if (!routes) {
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
  initialize(profile, repository) {
    return this.runLongOperation('initialize', 'post', { profile, repository });
  }

  /**
  * Get a user's access to this environment.
  *
  * @param string uuid
  *
  * @return EnvironmentAccess|false
  */
  getUser(id) {
    return EnvironmentAccess.get({ id }, this.getLink('#manage-access'));
  }
  /**
  * Get the users with access to this environment.
  *
  * @return EnvironmentAccess[]
  */
  getUsers() {
    return EnvironmentAccess.query(this.getLink('#manage-access'));
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
  addUser(user, role, byUuid = true) {
    const property = byUuid ? 'user' : 'email';
    const body = {role};

    body[property] = user;
    const environmentAccess = new EnvironmentAccess(body, this.getLink('#manage-access'));

    return environmentAccess.save();
  }

  /**
  * Get environment metrics.
  *
  * @param string query
  *   InfluxDB query
  *
  * @return Metric
  */
  getMetrics(query) {
    const params = query && { q: query };

    return Metric.get(params, `${this.getUri()}/metrics`);
  }
}
