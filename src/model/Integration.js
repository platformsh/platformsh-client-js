import Ressource from './Ressource';
import {request} from '../api';

const paramDefaults = {};
const types = ['bitbucket', 'hipchat', 'github', 'webhook'];

export default class Integration extends Ressource {
  constructor(integration, url) {
    const { id } = integration;

    super(url, paramDefaults, { id }, integration, ['type']);
    this._required = ['type'];
    this.id = '';
    this.type = '';
  }

  /**
   * @inheritdoc
   */
  checkProperty(property, value) {
    const errors = {};

    if (property === 'type' && types.indexOf(value) === -1) {
      errors[property] = `Invalid type: '${value}'`;
    }
    return errors;
  }

  static get(params, url) {
    const { id, ...queryParams } = params;

    return super.get(`${url}/:id`, { id }, paramDefaults, queryParams);
  }

  static query(params, url) {
    return super.query(url, {}, paramDefaults, params);
  }

  /**
   * Trigger the integration's web hook.
   *
   * Normally the external service should do this in response to events, but
   * it may be useful to trigger the hook manually in certain cases.
   */
  triggerHook() {
    const hookUrl = this.getLink('#hook');

    return request(hookUrl, 'post');
  }
}
