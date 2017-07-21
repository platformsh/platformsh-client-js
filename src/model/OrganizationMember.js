import Ressource from './Ressource';
import { getConfig } from '../config';

const paramDefaults = {};
const _url = '/platform/organizations/:organizationId/members';

const creatableField = ['user', 'role'];

export default class OrganizationMember extends Ressource {
  constructor(organizationMember, url) {
    super(url, paramDefaults, {}, organizationMember, creatableField, creatableField);
    this.user = '';
    this.role = '';
  }

  static get(params = {}, customUrl) {
    const { organizationId, id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super.get(customUrl || `${api_url}${_url}/:id`, { organizationId, id }, paramDefaults, queryParams);
  }

  static query(params, customUrl) {
    const { organizationId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super.query(customUrl || `${api_url}${_url}`, { organizationId }, paramDefaults, queryParams);
  }
}
