import Ressource from "./Ressource";
import { getConfig } from "../config";
import request from "../api";

const _url = "/users/:userId/connections";

export default class ConnectedAccount extends Ressource {
  constructor(connectedAccount, url, config) {
    const { provider } = connectedAccount;

    super(url, {}, {}, connectedAccount, [], [], config);

    this.provider = "";
    this.subject = "";
    this.created_at = "";
    this.updated_at = "";
  }

  static get(userId, providerName, config) {
    return super.get(
      `:api_url${_url}/:providerName`,
      { userId, providerName },
      super.getConfig(config)
    );
  }

  static query(userId, config) {
    return super.query(
      `:api_url${_url}`,
      { userId },
      super.getConfig(config),
      {},
      data => data.map(d => ({ id: d.provider, ...d }))
    );
  }

  delete(userId) {
    return request(this._url, "DELETE", {}, this.getConfig());
  }
}
