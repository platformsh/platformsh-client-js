import Ressource from './Ressource';
import { API_URL } from '../config';

const paramDefaults = {};
const url = `${API_URL}/ssh_keys/:id`;

export default class SshKey extends Ressource {
  constructor(sshKey) {
    const { id } = sshKey;

    super(url, paramDefaults, { id }, sshKey, ['title', 'value']);
    this._queryUrl = Ressource.getQueryUrl(url);
    this.changed = '';
    this.title = '';
    this.key_id = 0;
    this.fingerprint = '';
    this.value = '';
  }

  static get(params) {
    const {id, ...queryParams} = params;

    return super.get(url, { id }, paramDefaults, queryParams);
  }
}
