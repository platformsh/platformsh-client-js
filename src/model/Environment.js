import parse_url from 'parse_url';
import slugify from 'slugify';

import Ressource from './Ressource';

const paramDefaults = {};

export default class Environment extends Ressource {
  constructor(environment, url) {
    const { id } = environment;

    super(url, paramDefaults, { id }, environment);
    this.id = '';
    this.name = '';
  }

  static get(params, url) {
    const { id, ...queryParams } = params;

    return super.get(`${url}/:id`, { id }, paramDefaults, queryParams);
  }

  static query(params, url) {
    return super.query(url, {}, paramDefaults, params);
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
      throw new Error(`The environment '${this.id}' does not have an SSH URL. It may be currently inactive, or you may not have permission to SSH.`);
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
  * @param string $title The title of the new environment.
  * @param string $id    The ID of the new environment. This will be the Git
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
}
