import { APIObject } from "../Ressource";
import { getConfig } from "../../config";
import request from "../../api";
import { autoImplementWithResources } from "../utils";

import { ConnectionType } from "./types";

const _url = "/users/:userId/connections";

export default class ConnectedAccount extends autoImplementWithResources()<ConnectionType>() {
  constructor(connectedAccount: APIObject, url: string) {
    super(url, {}, {}, connectedAccount, [], []);
  }

  static get(userId: string, provider: string) {
    const { api_url } = getConfig();

    return super._get<ConnectedAccount>(`${api_url}${_url}/:provider`, { userId, provider });
  }

  static query(userId: string) {
    const { api_url } = getConfig();

    return super._query(`${api_url}${_url}`, { userId }, {}, {}, data => {
      if(Array.isArray(data)) {
        return data.map(d => ({ ...d, id: d.provider }))
      }

      return [];
    }
    );
  }

  delete() {
    return request(this._url, "DELETE");
  }
}
