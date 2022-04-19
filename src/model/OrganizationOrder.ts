import Ressource from "./Ressource";
import Order from "./Order";
import { getConfig } from "../config";
import CursoredResult from "./CursoredResult";

const url = "/organizations/:organizationId/orders/:id";

export interface OrganizationOrderGetParams {
  id: string;
  organizationId: string;
  [key: string]: any;
};

export interface OrganizationOrderQueryParams {
  organizationId: string;
  [key: string]: any;
};

export default class OrganizationOrder extends Order {
  static get(params: OrganizationOrderGetParams, customUrl?: string): Promise<OrganizationOrder> {
    const { organizationId, id, ...queryParams } = params;
    const { api_url } = getConfig();

    return Ressource._get.call(
      this,
      customUrl || `${api_url}${url}`,
      { organizationId, id },
      {},
      queryParams
    ) as Promise<OrganizationOrder>;
  }

  static query(params: OrganizationOrderQueryParams): Promise<OrganizationOrder[]> {
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
