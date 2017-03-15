import Ressource from './Ressource';
import Account from './Account';

const paramDefaults = {};

export default class ProjectAccess extends Ressource {
  constructor(projectAccess, url) {
    super(url, paramDefaults, {}, projectAccess);
    this.id = '';
    this.role = '';
  }

  static query(url) {
    return super.query(url);
  }

  /**
  * Get the account information for this user.
  *
  * @throws \Exception
  *
  * @return Account
  */
  static getAccount() {
    return Account.get(this.id).then(account => {
      if (!account) {
        throw new Error(`Account not found for user: ${this.id}`);
      }
      return account;
    });
  }
}
