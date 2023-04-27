import request from "../api";
import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const _url = "/users/:userId/connections";

export default class ConnectedAccount extends Ressource {
  provider: string;
  subject: string;
  created_at: string;
  updated_at: string;

  constructor(connectedAccount: APIObject, url: string) {
    super(url, {}, {}, connectedAccount, [], []);

    this.provider = "";
    this.subject = "";
    this.created_at = "";
    this.updated_at = "";
  }

  static async get(userId: string, provider: string) {
    const { api_url } = getConfig();

    return super._get<ConnectedAccount>(`${api_url}${_url}/:provider`, {
      userId,
      provider
    });
  }

  static async query(userId: string) {
    const { api_url } = getConfig();

    return super._query(`${api_url}${_url}`, { userId }, {}, {}, data => {
      if (Array.isArray(data)) {
        return data.map(d => ({ ...d, id: d.provider }));
      }

      return [];
    });
  }

  async delete() {
    return request(this._url, "DELETE");
  }
}
