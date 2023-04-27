import { getConfig } from "../config";

import type CursoredResult from "./CursoredResult";
import Order from "./Order";
import Ressource from "./Ressource";

const url = "/organizations/:organizationId/orders/:id";

export type OrganizationOrderGetParams = {
  [key: string]: any;
  id: string;
  organizationId: string;
};

export type OrganizationOrderQueryParams = {
  [key: string]: any;
  organizationId: string;
};

// @ts-expect-error solve the get and query function inheritance ts error
export default class OrganizationOrder extends Order {
  static async get(params: OrganizationOrderGetParams, customUrl?: string) {
    const { organizationId, id, ...queryParams } = params;
    const { api_url } = getConfig();

    return Ressource._get.call(
      this,
      customUrl ?? `${api_url}${url}`,
      { organizationId, id },
      {},
      queryParams
    );
  }

  static async query(params: OrganizationOrderQueryParams) {
    const { organizationId, ...queryParams } = params;
    const { api_url } = getConfig();

    return Ressource._query.call(
      this,
      this.getQueryUrl(`${api_url}${url}`),
      { organizationId },
      {},
      queryParams,
      data => (data as CursoredResult<OrganizationOrder>).items
    );
  }
}
