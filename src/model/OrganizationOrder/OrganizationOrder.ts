import Ressource, { APIObject } from "../Ressource";
import { getConfig } from "../../config";
import CursoredResult from "../CursoredResult";

import { OrderType, OrganizationOrderGetParams, OrganizationOrderQueryParams } from "./types";

import { autoImplementWithResources } from "../utils";

const _url = "/organizations/:organizationId/orders/:id";

// @ts-ignore
// TODO: solve the get and query function inheritance ts error
export default class OrganizationOrder extends autoImplementWithResources()<Omit<OrderType, "_links">>() {
  constructor(organizationOrder: APIObject, url = _url) {
    const { api_url } = getConfig();

    super(
      url || `${api_url}${url}`,
      {},
      {},
      organizationOrder
    );
  }
  
  static get(params: OrganizationOrderGetParams, customUrl?: string) {
    const { organizationId, id, ...queryParams } = params;
    const { api_url } = getConfig();

    return Ressource._get.call(
      this,
      customUrl || `${api_url}${_url}`,
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
      this.getQueryUrl(`${api_url}${_url}`),
      { organizationId },
      {},
      queryParams,
      data => (data as CursoredResult<OrganizationOrder>).items
    );
  }
}
