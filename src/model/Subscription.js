import Ressource from './Ressource';
import { API_URL } from '../config';

const paramDefaults = {};
const creatableField = [
  'project_region',
  'plan',
  'project_title',
  'storage',
  'environments',
  'activation_callback'
];
const url = `${API_URL}/subscriptions/:id`;

export default class Subscription extends Ressource {
  constructor(subscription) {
    const { id } = subscription;

    super(url, paramDefaults, { id }, subscription, creatableField);
    this._queryUrl = Ressource.getQueryUrl(url);
    this.id = '';
    this.status = '';
    this.owner = '';
    this.plan = '';
    this.environments = 0;
    this.storage = 0;
    this.user_licenses = 0;
    this.project_id = '';
    this.project_title = '';
    this.project_title = '';
    this.project_region = '';
    this.project_region_label = '';
    this.project_ui = '';
  }

  static get(params) {
    const {id, ...queryParams} = params;

    return super.get(url, { id }, paramDefaults, queryParams);
  }

  /**
  * @inheritdoc
  */
  checkProperty(property, value) {
    const errors = {};

    if (property === 'storage' && value < 1024) {
      errors[property] = 'Storage must be at least 1024 MiB';
    } else if (property === 'activation_callback') {
      if(!value.uri) {
        errors[property] = "A 'uri' key is required in the activation callback";
      } else if (!isUrl(value.uri)) {
        errors[property] = 'Invalid URI in activation callback';
      }
    }

    return errors;
  }
}
