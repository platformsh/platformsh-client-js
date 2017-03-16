import atob from 'atob';

import Ressource from './Ressource';
import { API_URL } from '../config';

const paramDefaults = {};
const url = `${API_URL}/ssh_keys/:id`;

export default class SshKey extends Ressource {
  constructor(sshKey) {
    const { id } = sshKey;

    super(url, paramDefaults, { id }, sshKey, ['title', 'value']);
    this._required = ['value'];
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

  /**
   * @inheritdoc
   */
  checkProperty(property, value) {
    const errors = {};

    if(property === 'value' && !this.validatePublicKey(value)) {
      errors[property] = 'The SSH key is invalid';
    }

    return errors;
  }

  /**
   * Validate an SSH public key.
   *
   * @param string value
   *
   * @return bool
   */
  validatePublicKey(value) {
    const filteredValue = value.replace(/\s+/, ' ');

    if (filteredValue.indexOf(' ') === -1) {
      return false;
    }
    const match = value.split(' ', 3);
    const type = match[0];
    let key;

    try {
      key = atob(match[1]);
    } catch(err) {
      return false;
    }

    if (['ssh-rsa', 'ssh-dsa'].indexOf(type) === -1 || !key) {
      return false;
    }
    return true;
  }
}
