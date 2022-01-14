import Ressource from "./Ressource";
import { getConfig } from "../config";

const url = "/v1/vouchers";
const paramDefaults = {};

export default class Voucher extends Ressource {
  constructor(account) {
    const { uuid } = account;
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, { uuid }, account);
    this.currency = "";
    this.discounted_orders = [];
    this.uuid = "";
    this.vouchers = [];
    this.vouchers_applied = 0;
    this.vouchers_remaining_balance = 0;
    this.vouchers_total = 0;
  }

  static get(params, customUrl) {
    const { uuid, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get(
      customUrl || `${api_url}${url}`,
      { uuid },
      paramDefaults,
      queryParams
    );
  }

  static query(params) {
    const { api_url } = getConfig();

    return super._query(
      `${api_url}${url}`,
      {},
      paramDefaults,
      params,
      data => data.vouchers
    );
  }
}
