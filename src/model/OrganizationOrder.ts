import { getConfig } from "../config";

import type { CursoredResult } from "./CursoredResult";
import { Order } from "./Order";
import { Ressource } from "./Ressource";

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

export class OrganizationOrder extends Order {
  static async get(params: OrganizationOrderGetParams, customUrl?: string) {
    const { organizationId, id, includeDetails, ...queryParams } = params;
    const { api_url } = getConfig();

    if (includeDetails) {
      queryParams.mode = "details";
    }

    return Ressource._get.call(
      this,
      customUrl ?? `${api_url}${url}`,
      { organizationId, id },
      {},
      queryParams
    ) as Promise<OrganizationOrder>;
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
    ) as Promise<OrganizationOrder[]>;
  }
}
