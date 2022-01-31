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

// @ts-ignore
// TODO: solve the get and query function inheritance ts error
export default class OrganizationOrder extends Order {
  static get(params: OrganizationOrderGetParams, customUrl?: string) {
    const { organizationId, id, ...queryParams } = params;
    const { api_url } = getConfig();

    return Ressource._get.call(
      this,
      customUrl || `${api_url}${url}`,
      { organizationId, id },
      {},
      queryParams
    );
  }

  static query(params: OrganizationOrderQueryParams) {
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
