import { authenticatedRequest } from "../api";
import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import { Ressource } from "./Ressource";

const _url = "/users/:userId/connections";

export class ConnectedAccount extends Ressource {
  provider: string;
  provider_type: string;
  subject: string;
  created_at: string;
  updated_at: string;

  constructor(connectedAccount: APIObject, url: string) {
    super(url, {}, {}, connectedAccount, [], []);

    this.provider = connectedAccount.provider;
    this.provider_type =
      connectedAccount.provider_type || connectedAccount.provider;
    this.subject = connectedAccount.subject;
    this.created_at = connectedAccount.created_at;
    this.updated_at = connectedAccount.updated_at;
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

    return super._query<ConnectedAccount>(
      `${api_url}${_url}`,
      { userId },
      {},
      {},
      data => {
        if (Array.isArray(data)) {
          return data.map(d => ({ ...d, id: d.provider }));
        }

        return [];
      }
    );
  }

  async delete() {
    return authenticatedRequest(this._url, "DELETE");
  }
}
