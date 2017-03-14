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
}
