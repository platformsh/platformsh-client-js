import Ressource from "./Ressource";
import { getConfig } from "../config";

const url = "/organizations/:organizationId/vouchers";
const paramDefaults = {};

export default class OrganizationVoucher extends Ressource {
  constructor(voucher, customUrl) {
    const { api_url } = getConfig();

    super(customUrl || `${api_url}${url}`, paramDefaults, {}, voucher);
    this.currency = "";
    this.discounted_orders = [];
    this.vouchers = [];
    this.vouchers_applied = 0;
    this.vouchers_remaining_balance = 0;
    this.vouchers_total = 0;
  }

  static get(params, customUrl) {
    const { organizationId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get(
      customUrl || `${api_url}${url}`,
      { organizationId },
      {},
      queryParams
    );
  }

  static query(params) {
    const { organizationId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query(
      `${api_url}${url}`,
      { organizationId },
      {},
      queryParams,
      data => data.vouchers
    );
  }
}
