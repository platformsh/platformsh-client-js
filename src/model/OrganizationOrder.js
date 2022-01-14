import Ressource from "./Ressource";
import Order from "./Order";
import { getConfig } from "../config";

const url = "/organizations/:organizationId/orders/:id";

export default class OrganizationOrder extends Order {
  static get(params, customUrl) {
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

  static query(params) {
    const { organizationId, ...queryParams } = params;
    const { api_url } = getConfig();

    return Ressource._query.call(
      this,
      this.getQueryUrl(`${api_url}${url}`),
      { organizationId },
      {},
      queryParams,
      data => data.items
    );
  }
}
