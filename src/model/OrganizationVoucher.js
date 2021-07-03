import Ressource from "./Ressource";
import { getConfig } from "../config";

const url = "/organizations/:organizationId/vouchers";
const paramDefaults = {};

export default class OrganizationVoucher extends Ressource {
  constructor(account, customUrl) {
    const { uuid } = account;
    const { api_url } = getConfig();

    super(customUrl || `${api_url}${url}`);
  }

  static get(params, customUrl) {
    const { organizationId, ...queryParams } = params;
    const { api_url } = getConfig();

    return Ressource.get.call(
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

    return Ressource.query.call(
      this,
      `${api_url}${url}`,
      { organizationId },
      {},
      queryParams,
      data => data.items
    );
  }
}
