import Ressource from './Ressource';
import { getConfig } from '../config';

const paramDefaults = {};
const _url = '/platform/teams/:teamId/members';

const creatableField = ['role'];

export default class TeamMember extends Ressource {
  constructor(teamMember, url) {
    super(url, paramDefaults, {}, teamMember, creatableField, creatableField);
    this.user = '';
  }

  static get(params = {}, customUrl) {
    const { teamId, id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super.get(customUrl || `${api_url}${_url}/:id`, { teamId, id }, paramDefaults, queryParams);
  }

  static query(params, customUrl) {
    const { teamId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super.query(customUrl || `${api_url}${_url}`, { teamId }, paramDefaults, queryParams);
  }
}
