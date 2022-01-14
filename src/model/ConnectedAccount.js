import Ressource from "./Ressource";
import { getConfig } from "../config";
import request from "../api";

const _url = "/users/:userId/connections";

export default class ConnectedAccount extends Ressource {
  constructor(connectedAccount, url) {
    const { provider } = connectedAccount;
    const { api_url } = getConfig();

    super(url, {}, {}, connectedAccount, [], []);

    this.provider = "";
    this.subject = "";
    this.created_at = "";
    this.updated_at = "";
  }

  static get(userId, provider) {
    const { api_url } = getConfig();

    return super._get(`${api_url}${_url}/:provider`, { userId, provider });
  }

  static query(userId) {
    const { api_url } = getConfig();

    return super._query(`${api_url}${_url}`, { userId }, {}, {}, data =>
      data.map(d => ({ id: d.provider, ...d }))
    );
  }

  delete(userId) {
    return request(this._url, "DELETE");
  }
}
